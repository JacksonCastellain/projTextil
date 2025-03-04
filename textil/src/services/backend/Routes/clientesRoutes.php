<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'clientes') {
    header('Content-Type: application/json');

    try {
        $stmt = $pdo->prepare("
        SELECT 
          p.pess_id AS id, 
          p.nome, 
          p.ender, 
          p.fone, 
          c.cnpj
        FROM 
          pessoa p 
        JOIN 
          cliente c 
        ON 
          p.pess_id = c.pess_id
          ORDER BY
          p.pess_id ASC
        ");
        $stmt->execute();
        $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['clientes' => $clientes]);
    } catch (PDOException $e) {
        error_log('Erro PDO: ' . $e->getMessage());
        echo json_encode(['error' => 'Erro ao buscar clientes: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'addCliente') {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    // Verifica se todos os campos estão presentes e não vazios
    if (empty($data['nome']) || empty($data['ender']) || empty($data['fone']) || empty($data['cnpj'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Todos os campos são obrigatórios']);
        exit;
    }

    function limparCNPJ($cnpj) {
        return preg_replace('/[^0-9]/',  '', trim($cnpj));
    }

    // Função para validar o CNPJ
    function validarCNPJ($cnpj) {
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        if (preg_match('/(\d)\1{13}/', $cnpj)) {
            return false;
        }
        for ($t = 12; $t < 14; $t++) {
            $d = 0;
            $p = $t - 7;
            for ($c = 0; $c < $t; $c++) {
                $d += $cnpj[$c] * $p;
                $p = ($p < 3) ? 9 : --$p;
            }
            if ($cnpj[$t] != ((10 * $d) % 11) % 10) {
                return false;
            }
        }
        return true;
    }

    // Limpa o CNPJ
    $cnpjLimpo = limparCNPJ($data['cnpj']);

    // Valida o CNPJ
    if (!validarCNPJ($cnpjLimpo)) {
        echo json_encode(["error" => "CNPJ inválido POST"]);
        exit;
    }

    // Verifica se o CNPJ já está cadastrado
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM cliente WHERE cnpj = :cnpj");
        $stmt->execute(['cnpj' => $cnpjLimpo]);
        if ($stmt->fetchColumn() > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'CNPJ já cadastrado']);
            exit;
        }
    } catch (PDOException $e) {
        error_log('Erro ao verificar CNPJ: ' . $e->getMessage());
        echo json_encode(['error' => 'Erro interno ao verificar CNPJ']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Insere na tabela pessoa
        $stmt = $pdo->prepare("INSERT INTO pessoa (nome, ender, fone) VALUES (:nome, :ender, :fone)");
        $stmt->execute(['nome' => $data['nome'], 'ender' => $data['ender'], 'fone' => $data['fone']]);
        $pess_id = $pdo->lastInsertId();

        error_log('ID gerado: ' . $pess_id); // Log para depuração

        if (!$pess_id) {
            http_response_code(500);
            echo json_encode(['error' => 'Falha ao gerar ID']);
            exit;
        }

        // Insere na tabela cliente
        $stmt = $pdo->prepare("INSERT INTO cliente (pess_id, cnpj) VALUES (:pess_id, :cnpj)");
        $stmt->execute(['pess_id' => $pess_id, 'cnpj' => $cnpjLimpo]);

        $pdo->commit();

        // Retorna os dados do cliente recém-adicionado
        http_response_code(201);
        echo json_encode([
            'message' => 'Cliente adicionado com sucesso',
            'cliente' => [
                'id' => $pess_id,
                'nome' => $data['nome'],
                'ender' => $data['ender'],
                'fone' => $data['fone'],
                'cnpj' => $cnpjLimpo
            ]
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log('Erro PDO: ' . $e->getMessage());
        echo json_encode(['error' => 'Erro interno ao adicionar cliente']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'updateCliente') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'];

    // Função para limpar o CNPJ
    function limparCNPJ($cnpj) {
        return preg_replace('/[^0-9]/', '', $cnpj);
    }

    // Função para validar o CNPJ
    function validarCNPJ($cnpj) {
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        if (strlen($cnpj) != 14 || preg_match('/(\d)\1{13}/', $cnpj)) {
            return false;
        }
        for ($t = 12; $t < 14; $t++) {
            $d = 0;
            $p = $t - 7;
            for ($c = 0; $c < $t; $c++) {
                $d += $cnpj[$c] * $p;
                $p = ($p < 3) ? 9 : --$p;
            }
            if ($cnpj[$t] != ((10 * $d) % 11) % 10) {
                return false;
            }
        }
        return true;
    }

    // Verifica se o CNPJ foi enviado
    if (empty($data['cnpj'])) {
        echo json_encode(["error" => "CNPJ é obrigatório"]);
        exit;
    }

    // Limpa o CNPJ
    $cnpjLimpo = limparCNPJ($data['cnpj']);

    // Valida o CNPJ
    if (!validarCNPJ($cnpjLimpo)) {
        echo json_encode(["error" => "CNPJ inválido"]);
        exit;
    }

    // Limpa o telefone
    $data['fone'] = preg_replace('/[^0-9]/', '', $data['fone']);

    try {
        $pdo->beginTransaction();

        $stmtPessoa = $pdo->prepare("UPDATE pessoa SET nome = ?, ender = ?, fone = ? WHERE pess_id = ?");
        $stmtPessoa->execute([$data['nome'], $data['ender'], $data['fone'], $id]);

        $stmtCliente = $pdo->prepare("UPDATE cliente SET cnpj = ? WHERE pess_id = ?");
        $stmtCliente->execute([$cnpjLimpo, $id]);

        $pdo->commit();

        echo json_encode([
            "id" => $id,
            "nome" => $data['nome'],
            "ender" => $data['ender'],
            "fone" => $data['fone'],
            "cnpj" => $cnpjLimpo
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log('Erro PDO: ' . $e->getMessage());
        echo json_encode(['error' => 'Erro ao atualizar cliente: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['action']) && $_GET['action'] === 'deleteCliente') {
    header('Content-Type: application/json');
    $id = $_GET['id'];

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("DELETE FROM cliente WHERE pess_id = ?");
        $stmt->execute([$id]);

        $stmt = $pdo->prepare("DELETE FROM pessoa WHERE pess_id = ?");
        $stmt->execute([$id]);

        $pdo->commit();
        echo json_encode(['message' => 'Cliente excluído com sucesso']);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log('Erro PDO: ' . $e->getMessage());
        echo json_encode(['error' => 'Erro ao excluir cliente: ' . $e->getMessage()]);
    }
    exit;
}