<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'colaboradores') {
    header('Content-Type: application/json');

    try {
        // Consulta para obter dados combinados de pessoa e funcionario
        $stmt = $pdo->prepare("
            SELECT 
                p.pess_id AS id,
                p.nome,
                p.ender,
                p.fone,
                p.is_admin,
                f.cpf,
                '********' AS senha -- Oculta a senha por segurança
            FROM 
                pessoa p
            JOIN 
                funcionario f 
            ON 
                p.pess_id = f.pess_id
            ORDER BY 
                p.pess_id ASC
        ");
        $stmt->execute();

        // Obtém os resultados
        $colaboradores = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Retorna os dados como JSON
        echo json_encode(["colaboradores" => $colaboradores]);
    } catch (PDOException $e) {
        // Registra o erro no log e retorna uma resposta JSON de erro
        error_log('Erro PDO: ' . $e->getMessage());
        echo json_encode(["error" => "Erro ao buscar colaboradores"]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'updateColaborador') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'];

    // Validação dos campos obrigatórios
    if (!$id ) {
        echo json_encode(["error" => "ID é obrigatório"]);
        exit;
    }

    $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);

    try {
        $pdo->beginTransaction();

        // Atualiza na tabela `pessoa`
        $stmtPessoa = $pdo->prepare("UPDATE pessoa SET nome = ?, ender = ?, fone = ?, is_admin = ? WHERE pess_id = ?");
        $stmtPessoa->execute([$data['nome'], $data['ender'], $data['fone'], $data['is_admin'] ? 'true' : 'false', $id]);

        // Atualiza na tabela `funcionario`
        $stmtFuncionario = $pdo->prepare("UPDATE funcionario SET cpf = ?, senha = ? WHERE pess_id = ?");
        $stmtFuncionario->execute([$data['cpf'], $senhaHash, $id]);

        $pdo->commit();

        // Retorna o colaborador atualizado
        echo json_encode([
            "id" => $id,
            "nome" => $data['nome'],
            "cpf" => $data['cpf'],
            "senha" => "********",
            "ender" => $data['ender'],
            "fone" => $data['fone'],
            "is_admin" => $data['is_admin']
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["error" => "Erro ao atualizar colaborador: " . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'addColaborador') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);

    function limparCPF($cpf) {
        return preg_replace('/[^0-9]/', '', $cpf);
    }

    function validarCPF($cpf) {

        if (strlen($cpf) != 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        // Calcula os dígitos verificadores para verificar se o CPF é válido
        for ($t = 9; $t < 11; $t++) {
            for ($d = 0, $c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }

        return true;
    }
    // Validação dos campos obrigatórios
    if (!$data['nome'] || !$data['cpf'] || !$data['senha']) {
        echo json_encode(["error" => "Nome, CPF e senha sao obrigatorios"]);
        exit;
    }

    $cpfLimpo = limparCPF($data['cpf']);
    if (!validarCPF($cpfLimpo)) {
        echo json_encode(["error" => "CPF inválido"]);
        exit;
    }

    $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);

    try {
        $pdo->beginTransaction();

        // Insere na tabela `pessoa`
        $stmtPessoa = $pdo->prepare("INSERT INTO pessoa (nome, ender, fone, is_admin) VALUES (?, ?, ?, ?)");
        $stmtPessoa->execute([$data['nome'], $data['ender'], $data['fone'], $data['is_admin'] ? 'true' : 'false']);

        // Obtém o ID gerado
        $pess_id = $pdo->lastInsertId();

        // Insere na tabela `funcionario`
        $stmtFuncionario = $pdo->prepare("INSERT INTO funcionario (pess_id, cpf, senha) VALUES (?, ?, ?)");
        $stmtFuncionario->execute([$pess_id, $cpfLimpo, $senhaHash]);

        $pdo->commit();

        // Retorna o novo colaborador com o ID
        http_response_code(201);
        echo json_encode([
            "id" => $pess_id,
            "nome" => $data['nome'],
            "cpf" => $data['cpf'],
            "senha" => "********",
            "ender" => $data['ender'],
            "fone" => $data['fone'],
            "is_admin" => $data['is_admin']
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["error" => "Erro ao adicionar colaborador: " . $e->getMessage()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['action']) && $_GET['action'] === 'deleteColaborador') {
    header('Content-Type: application/json');
    $id = $_GET['id'];

    try {
        // Inicia uma transação
        $pdo->beginTransaction();

        // Exclui o registro da tabela `funcionario`
        $stmtFuncionario = $pdo->prepare("DELETE FROM funcionario WHERE pess_id = ?");
        $stmtFuncionario->execute([$id]);

        // Exclui o registro da tabela `pessoa`
        $stmtPessoa = $pdo->prepare("DELETE FROM pessoa WHERE pess_id = ?");
        $stmtPessoa->execute([$id]);

        // Verifica se algum registro foi excluído
        if ($stmtPessoa->rowCount() > 0) {
            $pdo->commit();
            echo json_encode(["message" => "Colaborador deletado com sucesso"]);
        } else {
            $pdo->rollBack();
            echo json_encode(["error" => "Nenhum colaborador encontrado com este ID"]);
        }
    } catch (PDOException $e) {
        // Reverte a transação em caso de erro
        $pdo->rollBack();
        error_log('Erro PDO: ' . $e->getMessage());
        echo json_encode(["error" => "Erro interno no servidor"]);
    }
}

?>