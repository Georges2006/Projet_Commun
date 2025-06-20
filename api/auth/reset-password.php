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
    
    $token = $input['token'] ?? '';
    $password = $input['password'] ?? '';
    $confirmPassword = $input['confirmPassword'] ?? '';
    
    if (empty($token)) {
        throw new Exception('Token requis');
    }
    
    if (empty($password) || strlen($password) < 8) {
        throw new Exception('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if ($password !== $confirmPassword) {
        throw new Exception('Les mots de passe ne correspondent pas');
    }
    
    $pdo = Database::getPostgresConnection();
    
    // Vérification du token
    $stmt = $pdo->prepare("
        SELECT pr.user_id, pr.expires_at, u.email 
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
    
    // Mise à jour du mot de passe
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $resetRequest['user_id']]);
    
    // Marquer le token comme utilisé
    $stmt = $pdo->prepare("UPDATE password_resets SET used = true WHERE token = ?");
    $stmt->execute([$token]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Mot de passe réinitialisé avec succès'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>