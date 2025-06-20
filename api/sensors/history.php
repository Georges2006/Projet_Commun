<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getMySQLConnection();
    
    // Récupérer le nombre d'heures depuis les paramètres (défaut: 24h)
    $hours = isset($_GET['hours']) ? (int)$_GET['hours'] : 24;
    
    // Récupérer les données historiques pour chaque capteur
    $sensors = ['humidity', 'temperature', 'light'];
    $history = [];
    
    foreach ($sensors as $sensor) {
        $query = "SELECT val, created_at FROM $sensor 
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL $hours HOUR)
                  ORDER BY created_at ASC";
        $stmt = $pdo->query($query);
        $results = $stmt->fetchAll();
        
        $history[$sensor] = [];
        foreach ($results as $row) {
            $history[$sensor][] = [
                'value' => (float)$row['val'],
                'timestamp' => $row['created_at']
            ];
        }
    }
    
    // Réponse avec données historiques
    $response = [
        'success' => true,
        'data' => $history,
        'period' => $hours . 'h'
    ];
    
    header('Content-Type: application/json');
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération des données historiques: ' . $e->getMessage()
    ]);
}
?>