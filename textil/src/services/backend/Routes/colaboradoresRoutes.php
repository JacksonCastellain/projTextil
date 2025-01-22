<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    try {
        $stmt = $pdo->query("SELECT pess_id AS id, nome, ender, fone, is_admin FROM pessoa");
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

?>