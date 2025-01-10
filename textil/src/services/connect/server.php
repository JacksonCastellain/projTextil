<?php

require 'conn.php';

$allowed_origins = ['http://localhost:5173', 'http://localhost:5174'];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dsn = "pgsql:host=$host;dbname=$db"; 
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    error_log("Connected to database");
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  header('Content-Type: application/json');
  try {
      $stmt = $pdo->query("SELECT * from pessoa");
      $pessoa = $stmt->fetchAll();
      echo json_encode($pessoa);
  } catch (PDOException $e) {
      echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
  }
}

?>