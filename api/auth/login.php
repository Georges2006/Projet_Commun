<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Données JSON invalides');
    }
    
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        throw new Exception('Email et mot de passe requis');
    }
    
    $pdo = Database::getPostgresConnection();
    
    // Récupération de l'utilisateur
    $stmt = $pdo->prepare("SELECT id, username, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Email ou mot de passe incorrect');
    }
    
    // Vérification du mot de passe
    if (!password_verify($password, $user['password'])) {
        throw new Exception('Email ou mot de passe incorrect');
    }
    
    // Création de la session
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['username'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'data' => [
            'id' => $user['id'],
            'name' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'] ?? 'user'  // Ajouter le rôle avec une valeur par défaut
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>