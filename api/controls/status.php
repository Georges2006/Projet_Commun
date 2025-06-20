<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    // Pour l'instant, retourner des valeurs par défaut
    // En production, vous pourriez stocker ces valeurs dans une base de données
    $controlsStatus = [
        'watering' => false,
        'ventilation' => false,
        'lighting' => false,
        'heating' => false
    ];
    
    // Vérifier s'il y a un fichier de statut local
    $statusFile = '../data/controls_status.json';
    if (file_exists($statusFile)) {
        $savedStatus = json_decode(file_get_contents($statusFile), true);
        if ($savedStatus) {
            $controlsStatus = array_merge($controlsStatus, $savedStatus);
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $controlsStatus,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération du statut des contrôles: ' . $e->getMessage(),
        'data' => [
            'watering' => false,
            'ventilation' => false,
            'lighting' => false,
            'heating' => false
        ]
    ]);
}
?> 