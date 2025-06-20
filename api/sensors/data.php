<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getMySQLConnection();
    
    // Récupérer la dernière valeur d'humidité
    $stmt = $pdo->query("SELECT val, created_at FROM humidity ORDER BY created_at DESC LIMIT 1");
    $humidity = $stmt->fetch();
    
    // Récupérer la dernière valeur de température
    $stmt = $pdo->query("SELECT val, created_at FROM temperature ORDER BY created_at DESC LIMIT 1");
    $temperature = $stmt->fetch();
    
    // Récupérer la dernière valeur de luminosité
    $stmt = $pdo->query("SELECT val, created_at FROM light ORDER BY created_at DESC LIMIT 1");
    $light = $stmt->fetch();
    
    $sensorData = [
        'humidity' => $humidity ? [
            'value' => (float)$humidity['val'],
            'timestamp' => $humidity['created_at']
        ] : null,
        'temperature' => $temperature ? [
            'value' => (float)$temperature['val'],
            'timestamp' => $temperature['created_at']
        ] : null,
        'light' => $light ? [
            'value' => (float)$light['val'],
            'timestamp' => $light['created_at']
        ] : null
    ];
    
    // Si pas de données réelles, utiliser des données simulées
    if (!$humidity && !$temperature && !$light) {
        $sensorData = [
            'humidity' => [
                'value' => rand(70, 90),
                'timestamp' => date('Y-m-d H:i:s')
            ],
            'temperature' => [
                'value' => rand(18, 28),
                'timestamp' => date('Y-m-d H:i:s')
            ],
            'light' => [
                'value' => rand(300, 800),
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $sensorData,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération des données: ' . $e->getMessage(),
        'data' => [
            'humidity' => [
                'value' => rand(70, 90),
                'timestamp' => date('Y-m-d H:i:s')
            ],
            'temperature' => [
                'value' => rand(18, 28),
                'timestamp' => date('Y-m-d H:i:s')
            ],
            'light' => [
                'value' => rand(300, 800),
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]
    ]);
}
?> 