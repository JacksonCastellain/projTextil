<?php
require 'conn.php';

session_start(); 

$allowed_origins = ['http://localhost:5173', 'http://localhost:5174'];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Conexão com o banco de dados
$dsn = "pgsql:host=$host;dbname=$db"; 
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    error_log("Connected to database");
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
    exit;
}

// Verifica se é um pedido de login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    try {
        $stmt = $pdo->prepare("SELECT senha FROM pessoa WHERE nome = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['senha'])) {
            $_SESSION['user'] = $username;  // Salva o nome de usuário na sessão
            echo json_encode(['message' => 'Login bem-sucedido']);
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(['error' => 'Nome de usuário ou senha incorretos']);
            error_log("Password from input: $password");
            error_log("Password hash from database: " . $user['senha']);
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
    echo json_encode(['error' => 'Acesso não autorizado']);
    exit;
}


// Processa requisições GET protegidas
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['user'])) {
        http_response_code(401); 
        echo json_encode(['error' => 'Acesso não autorizado']);
        exit;
    }
    header('Content-Type: application/json');
    try {
        $stmt = $pdo->query("SELECT pess_id, nome FROM pessoa");
        $pessoa = $stmt->fetchAll();
        echo json_encode($pessoa);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
    }
}

?>
