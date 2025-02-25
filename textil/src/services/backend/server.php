<?php

require_once __DIR__ . '/../connect/conn.php';


ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

$allowed_origins = ['http://localhost:5173/textil/', 'http://localhost:5174'];
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

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    error_log("Connected to database");

    // Seleciona todas as senhas existentes
    $stmt = $pdo->query("SELECT pess_id, senha FROM funcionario");
    $users = $stmt->fetchAll();

    foreach ($users as $user) {
        $pess_id = $user['pess_id'];
        $old_password = $user['senha'];

        // Verifica se a senha já está criptografada
        if (!password_needs_rehash($old_password, PASSWORD_DEFAULT)) {
            continue; // Já está criptografada, não faz nada
        }

        // Criptografa a senha
        $new_password_hash = password_hash($old_password, PASSWORD_DEFAULT);

        // Atualiza a senha no banco de dados
        $update_stmt = $pdo->prepare("UPDATE funcionario SET senha = :senha WHERE pess_id = :pess_id");
        $update_stmt->execute(['senha' => $new_password_hash, 'pess_id' => $pess_id]);

        error_log("Senha atualizada para pess_id: $pess_id");
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    try {
        // Busca o ID da pessoa pelo nome de usuário
        $stmt = $pdo->prepare("SELECT pess_id FROM pessoa WHERE nome = :username");
        $stmt->execute(['username' => $username]);
        $pess_id = $stmt->fetchColumn();

        if (!$pess_id) {
            http_response_code(401);
            echo json_encode(['error' => 'Nome de usuário ou senha incorretos']);
            exit;
        }

        // Busca a senha do funcionário pelo ID da pessoa
        $stmt = $pdo->prepare("SELECT senha FROM funcionario WHERE pess_id = :pess_id");
        $stmt->execute(['pess_id' => $pess_id]);
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
    require __DIR__ . '/Routes/colaboradoresRoutes.php';
    error_log("Usuário logado: " . ($_SESSION['user'] ?? 'Nenhum usuário logado'));
}

if ($_GET['action'] === 'clientes' || $_GET['action'] === 'updateCliente' || $_GET['action'] === 'addCliente' || $_GET['action'] === 'deleteCliente') {
    require __DIR__ . '/Routes/clientesRoutes.php';
    error_log("Usuário logado: " . ($_SESSION['user'] ?? 'Nenhum usuário logado'));
}

?>