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
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email invalide');
    }
    
    $pdo = Database::getPostgresConnection();
    
    // Vérification si l'utilisateur existe
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
        echo json_encode([
            'success' => true,
            'message' => 'Si cet email existe dans notre base, vous recevrez un email de réinitialisation'
        ]);
        exit;
    }
    
    // Génération d'un token unique
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Suppression des anciens tokens pour cet utilisateur
    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    
    // Insertion du nouveau token
    $stmt = $pdo->prepare("
        INSERT INTO password_resets (user_id, token, expires_at, created_at) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([
        $user['id'],
        $token,
        $expiresAt,
        date('Y-m-d H:i:s')
    ]);
    
    // Envoi de l'email (à implémenter avec SMTP)
    $resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/reset-password.html?token=" . $token;
    
    // TODO: Remplacer par l'envoi SMTP réel
    $to = $email;
    $subject = "Réinitialisation de mot de passe - SerreConnect";
    $message = "
    Bonjour {$user['username']},
    
    Vous avez demandé la réinitialisation de votre mot de passe.
    
    Cliquez sur le lien suivant pour réinitialiser votre mot de passe :
    {$resetLink}
    
    Ce lien expire dans 1 heure.
    
    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    
    Cordialement,
    L'équipe SerreConnect
    ";
    
    $headers = "From: noreply@serreconnect.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Envoi temporaire (à remplacer par SMTP)
    mail($to, $subject, $message, $headers);
    
    echo json_encode([
        'success' => true,
        'message' => 'Si cet email existe dans notre base, vous recevrez un email de réinitialisation'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>