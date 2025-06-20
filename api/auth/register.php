<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/smtp.php';

// Inclure PHPMailer
require_once __DIR__ . '/../../PHPMailer-master/src/PHPMailer.php';
require_once __DIR__ . '/../../PHPMailer-master/src/Exception.php';
require_once __DIR__ . '/../../PHPMailer-master/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input && $_POST) {
        $input = $_POST;
    }
    
    if (!$input) {
        throw new Exception('Données JSON invalides');
    }
    
    // Validation des données
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $confirmPassword = $input['confirmPassword'] ?? '';
    
    // Validation du nom
    if (empty($name) || strlen($name) < 2) {
        throw new Exception('Le nom doit contenir au moins 2 caractères');
    }
    
    // Validation de l'email
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email invalide');
    }
    
    // Validation du mot de passe
    if (empty($password) || strlen($password) < 8) {
        throw new Exception('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if ($password !== $confirmPassword) {
        throw new Exception('Les mots de passe ne correspondent pas');
    }
    
    // Vérification si l'email existe déjà
    $pdo = Database::getPostgresConnection();
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        throw new Exception('Cet email est déjà utilisé');
    }
    
    // Hachage du mot de passe
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Génération du code de vérification
    $verificationCode = rand(100000, 999999);
    $verificationExpires = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Insertion de l'utilisateur
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, email_verified, verification_code, verification_expires, created_at) 
        VALUES (?, ?, ?, false, ?, ?, ?)
    ");
    
    $stmt->execute([
        $name,
        $email,
        $hashedPassword,
        $verificationCode,
        $verificationExpires,
        date('Y-m-d H:i:s')
    ]);
    
    $userId = $pdo->lastInsertId();
    
    // Envoi de l'email de vérification
    try {
        $mail = new PHPMailer();
        $mail->SMTPDebug = 0; // Désactiver le debug
        
        // Configuration SMTP
        $mail->isSMTP();
        $mail->Host = SMTPConfig::$smtp_host;
        $mail->SMTPAuth = true;
        $mail->Username = SMTPConfig::$smtp_username;
        $mail->Password = SMTPConfig::$smtp_password;
        $mail->SMTPSecure = SMTPConfig::$smtp_secure;
        $mail->Port = SMTPConfig::$smtp_port;
        $mail->CharSet = 'UTF-8';

        // Forcer l'utilisation d'OpenSSL sans vérification stricte
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Expéditeur et destinataire
        $mail->setFrom(SMTPConfig::$from_email, SMTPConfig::$from_name);
        $mail->addAddress($email, $name);
        
        // Sujet et contenu
        $mail->Subject = "SerreConnect - Vérification de votre compte";
        
        // Corps HTML de l'email
        $mail->isHTML(true);
        $mail->Body = generateVerificationEmailHTML($name, $email, $verificationCode);
        $mail->AltBody = generateVerificationEmailText($name, $email, $verificationCode);
        
        // Debug - à retirer après
        error_log("Tentative d'envoi d'email à : " . $email);
        error_log("Configuration SMTP : " . SMTPConfig::$smtp_host . ":" . SMTPConfig::$smtp_port);
        error_log("Expéditeur : " . SMTPConfig::$from_email);

        // Debug SMTP
        error_log("=== DEBUG EMAIL ===");
        error_log("Destinataire: " . $email);
        error_log("SMTP Host: " . SMTPConfig::$smtp_host);
        error_log("SMTP Port: " . SMTPConfig::$smtp_port);
        error_log("SMTP User: " . SMTPConfig::$smtp_username);

        // Activer le debug SMTP
        $mail->SMTPDebug = 2;
        $mail->Debugoutput = function($str, $level) {
            error_log("PHPMailer: " . $str);
        };
        
        // Envoi de l'email
        $mail->send();
        error_log("Email envoyé avec succès à : " . $email);
        
        echo json_encode([
            'success' => true,
            'message' => 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
            'data' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'email_verified' => false
            ]
        ]);
        
    } catch (Exception $e) {
        // Si l'email ne peut pas être envoyé, supprimer l'utilisateur créé
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        throw new Exception('Erreur lors de l\'envoi de l\'email de vérification: ' . $e->getMessage());
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Fonction pour générer le HTML de l'email de vérification
function generateVerificationEmailHTML($name, $email, $code) {
    return "
    <!DOCTYPE html>
    <html lang=\"fr\">
    <head>
        <meta charset=\"UTF-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <title>Vérification de votre compte SerreConnect</title>
        <style>
            body {
                font-family: 'Inter', Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 2rem;
                text-align: center;
            }
            .logo {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            .title {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0;
            }
            .content {
                padding: 2rem;
                color: #333;
            }
            .greeting {
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
            }
            .code-container {
                background-color: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 1.5rem;
                text-align: center;
                margin: 1.5rem 0;
            }
            .verification-code {
                font-size: 2rem;
                font-weight: bold;
                color: #4CAF50;
                letter-spacing: 0.5rem;
                font-family: 'Courier New', monospace;
            }
            .instructions {
                margin: 1.5rem 0;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 1rem 2rem;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 1rem 0;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 1.5rem;
                text-align: center;
                color: #6c757d;
                font-size: 0.9rem;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class=\"container\">
            <div class=\"header\">
                <div class=\"logo\">🌱</div>
                <h1 class=\"title\">SerreConnect</h1>
            </div>
            
            <div class=\"content\">
                <div class=\"greeting\">
                    Bonjour <strong>$name</strong>,
                </div>
                
                <p>Merci de vous être inscrit sur SerreConnect ! Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
                
                <div class=\"code-container\">
                    <div class=\"verification-code\">$code</div>
                </div>
                
                <div class=\"instructions\">
                    <p><strong>Instructions :</strong></p>
                    <ol>
                        <li>Copiez le code ci-dessus</li>
                        <li>Retournez sur la page de connexion</li>
                        <li>Cliquez sur \"Vérifier mon compte\"</li>
                        <li>Entrez le code de vérification</li>
                    </ol>
                </div>
                
                <div class=\"warning\">
                    <strong>⚠️ Important :</strong> Ce code expire dans 1 heure. Si vous ne l'utilisez pas à temps, vous devrez demander un nouveau code.
                </div>
                
                <p>Si vous n'avez pas créé de compte sur SerreConnect, vous pouvez ignorer cet email.</p>
            </div>
            
            <div class=\"footer\">
                <p>&copy; 2024 SerreConnect. Tous droits réservés.</p>
                <p>Cet email a été envoyé à : $email</p>
            </div>
        </div>
    </body>
    </html>
    ";
}

// Fonction pour générer le texte brut de l'email
function generateVerificationEmailText($name, $email, $code) {
    return "
    Bonjour $name,
    
    Merci de vous être inscrit sur SerreConnect !
    
    Pour activer votre compte, utilisez le code de vérification suivant :
    
    CODE : $code
    
    Instructions :
    1. Copiez le code ci-dessus
    2. Retournez sur la page de connexion
    3. Cliquez sur \"Vérifier mon compte\"
    4. Entrez le code de vérification
    
    ⚠️ Important : Ce code expire dans 1 heure.
    
    Si vous n'avez pas créé de compte sur SerreConnect, vous pouvez ignorer cet email.
    
    --
    SerreConnect
    Cet email a été envoyé à : $email
    ";
}
?>