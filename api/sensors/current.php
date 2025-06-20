<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getMySQLConnection();

    // Récupérer les 2 dernières valeurs de chaque capteur
    $sensors = ['humidity', 'temperature', 'light'];
    $currentData = [];
    $trends = [];

    foreach ($sensors as $sensor) {
        $query = "SELECT val, created_at FROM $sensor ORDER BY created_at DESC LIMIT 2";
        $stmt = $pdo->query($query);
        $results = $stmt->fetchAll();
        
        if (count($results) > 0) {
            $currentData[$sensor] = (float)$results[0]['val'];
            
            // Calculer la tendance si on a 2 valeurs
            if (count($results) > 1) {
                $current = (float)$results[0]['val'];
                $previous = (float)$results[1]['val'];
                $difference = $current - $previous;
                
                if (abs($difference) < 0.1) {
                    $trends[$sensor] = ['direction' => 'stable', 'value' => 0, 'text' => '→ 0'];
                } else if ($difference > 0) {
                    $trends[$sensor] = ['direction' => 'up', 'value' => abs($difference), 'text' => '↗ +' . number_format(abs($difference), 1)];
                } else {
                    $trends[$sensor] = ['direction' => 'down', 'value' => abs($difference), 'text' => '↘ -' . number_format(abs($difference), 1)];
                }
            } else {
                $trends[$sensor] = ['direction' => 'stable', 'value' => 0, 'text' => '→ 0'];
            }
        }
    }

    // Réponse avec données actuelles et tendances
    $response = [
        'success' => true,
        'data' => $currentData,
        'trends' => $trends,
        'timestamp' => date('Y-m-d H:i:s')
    ];

    header('Content-Type: application/json');
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération des données: ' . $e->getMessage()
    ]);
}
?>