<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    try {
        $stmt = $pdo->query("SELECT pess_id AS id, nome FROM pessoa");
        $colaborador = $stmt->fetchAll();
        echo json_encode($colaborador);
    } catch (PDOException $e) {
        error_log('Erro PDO: ' . $e->getMessage());
    }
}

?>