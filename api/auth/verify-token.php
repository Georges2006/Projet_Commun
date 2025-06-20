<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

try {
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        throw new Exception('Token requis');
    }
    
    $pdo = Database::getPostgresConnection();
    
    // Vérification du token
    $stmt = $pdo->prepare("
        SELECT pr.user_id, pr.expires_at, u.username, u.email 
        FROM password_resets pr 
        JOIN users u ON pr.user_id = u.id 
        WHERE pr.token = ? AND pr.used = false
    ");
    $stmt->execute([$token]);
    $resetRequest = $stmt->fetch();
    
    if (!$resetRequest) {
        throw new Exception('Token invalide ou déjà utilisé');
    }
    
    // Vérification de l'expiration
    if (strtotime($resetRequest['expires_at']) < time()) {
        throw new Exception('Le token a expiré');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Token valide',
        'data' => [
            'username' => $resetRequest['username'],
            'email' => $resetRequest['email']
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