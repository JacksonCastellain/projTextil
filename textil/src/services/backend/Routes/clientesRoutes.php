<?php

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'clientes') {
    header('Content-Type: application/json');

    try {
        $stmt = $pdo->prepare("
        SELECT 
          p.pess_id, 
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