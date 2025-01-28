<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'colaboradores') {
    header('Content-Type: application/json');
    try {
        $stmt = $pdo->query("SELECT pess_id AS id, nome, ender, fone, is_admin FROM pessoa order by pess_id asc");
        $colaborador = $stmt->fetchAll();
        echo json_encode($colaborador);
    } catch (PDOException $e) {
        error_log('Erro PDO: ' . $e->getMessage());
    }
}

if ($_GET['action'] === 'updateColaborador') {
    header('Content-Type: application/json');

    $id = $_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $data['nome'] ?? null; 
    $ender = $data['ender'] ?? null;
    $fone = $data['fone'] ?? null;
    $is_admin = $data['is_admin'] ?? false;

    if ($nome && $id) {
        $stmt = $pdo->prepare("UPDATE pessoa SET nome = ?, ender = ?, fone = ?, is_admin = ? WHERE pess_id = ?");
        if ($stmt->execute([$nome, $ender, $fone, $is_admin ? 'true' : 'false', $id])) {
            echo json_encode(["message" => "Colaborador atualizado com sucesso"]);
        } else {
            echo json_encode(["error" => "Erro ao atualizar colaborador"]);
        }
    } else {
        echo json_encode(["error" => "Dados inválidos recebidos"]);
    }
}

if ($_GET['action'] === 'addColaborador') {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(["error" => "Falha ao processar JSON. Dados não válidos."]);
        exit; 
    }

    $nome = $data['nome'] ?? null;
    $senha = $data['senha'] ?? null;
    $ender = $data['ender'] ?? null;
    $fone = $data['fone'] ?? null;
    $is_admin = $data['is_admin'] ?? false;

    if (!$nome || !$senha) {
        echo json_encode(["error" => "Nome e senha são obrigatórios"]);
        exit;
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO pessoa (nome, senha, ender, fone, is_admin) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$nome, $senhaHash, $ender, $fone, $is_admin ? 'true' : 'false'])) {
        echo json_encode(["message" => "Colaborador adicionado com sucesso"]);
    } else {
        echo json_encode(["error" => "Erro ao adicionar colaborador"]);
    }
}

if ($_GET['action'] === 'deleteColaborador') {
    header('Content-Type: application/json');

    $id = $_GET['id'];

    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM pessoa WHERE pess_id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(["message" => "Colaborador deletado com sucesso"]);
        } else {
            echo json_encode(["error" => "Erro ao deletar colaborador"]);
        }
    } else {
        echo json_encode(["error" => "Dados inválidos recebidos"]);
    }
}

?>