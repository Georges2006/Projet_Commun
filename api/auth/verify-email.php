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
    $code = trim($input['code'] ?? '');
    
    if (empty($email) || empty($code)) {
        throw new Exception('Email et code requis');
    }
    
    $pdo = Database::getPostgresConnection();
    
    // Vérification du code
    $stmt = $pdo->prepare("
        SELECT id, username, verification_expires 
        FROM users 
        WHERE email = ? AND verification_code = ? AND email_verified = false
    ");
    $stmt->execute([$email, $code]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Code de vérification invalide');
    }
    
    // Vérification de l'expiration
    if (strtotime($user['verification_expires']) < time()) {
        throw new Exception('Le code de vérification a expiré');
    }
    
    // Marquer l'email comme vérifié
    $stmt = $pdo->prepare("
        UPDATE users 
        SET email_verified = true, verification_code = NULL, verification_expires = NULL 
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
        'data' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $email
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