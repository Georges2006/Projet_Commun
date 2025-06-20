<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getPostgresConnection();
    
    // Récupérer tous les utilisateurs
    $query = "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC";
    $stmt = $pdo->query($query);
    $users = $stmt->fetchAll();
    
    // Si pas d'utilisateurs, créer l'utilisateur admin par défaut
    if (empty($users)) {
        $insertQuery = "INSERT INTO users (username, password, email, created_at) VALUES (:username, :password, :email, :created_at)";
        $stmt = $pdo->prepare($insertQuery);
        $stmt->execute([
            'username' => 'admin',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'email' => 'admin@example.com',
            'created_at' => date('Y-m-d H:i:s')
        ]);
        
        // Récupérer l'utilisateur créé
        $query = "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC";
        $stmt = $pdo->query($query);
        $users = $stmt->fetchAll();
    }
    
    // Formater les données pour l'affichage
    $formattedUsers = [];
    foreach ($users as $user) {
        $formattedUsers[] = [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => 'Administrateur', // Par défaut
            'created_at' => $user['created_at'],
            'status' => 'active'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $formattedUsers,
        'count' => count($formattedUsers)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération des utilisateurs: ' . $e->getMessage(),
        'data' => [
            [
                'id' => 1,
                'username' => 'admin',
                'email' => 'admin@example.com',
                'role' => 'Administrateur',
                'created_at' => '2025-06-14 23:08:09.395932',
                'status' => 'active'
            ]
        ]
    ]);
}
?> 