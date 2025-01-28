<?php

require_once __DIR__ . '/../connect/conn.php';


ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

$allowed_origins = ['http://localhost:5173', 'http://localhost:5174'];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    try {
        $stmt = $pdo->prepare("SELECT senha FROM pessoa WHERE nome = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['senha'])) {
            $_SESSION['user'] = $username;
            http_response_code(200);
            echo json_encode(['message' => 'Login bem-sucedido']);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Nome de usuário ou senha incorretos']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Erro ao verificar credenciais: ' . $e->getMessage()]);
    }
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'logout') {
    http_response_code(204); 
    session_destroy(); 
    echo json_encode(['message' => 'Logout bem-sucedido']);
    exit;
}

if (!isset($_SESSION['user']) && $_GET['action'] !== 'login' && $_GET['action'] !== 'logout') {
    http_response_code(401);
    echo json_encode(['error' => 'Faca login para acessar esta pagina']);
    exit;
}


if ($_GET['action'] === 'home') {
    require __DIR__ .  '/Routes/homeRoutes.php';
    error_log("Usuário logado: " . ($_SESSION['user'] ?? 'Nenhum usuário logado'));
} 


if ($_GET['action'] === 'colaboradores' || $_GET['action'] === 'updateColaborador' || $_GET['action'] === 'addColaborador' || $_GET['action'] === 'deleteColaborador') {
    require "Routes/colaboradoresRoutes.php";
    error_log("Usuário logado: " . ($_SESSION['user'] ?? 'Nenhum usuário logado'));
}

?>