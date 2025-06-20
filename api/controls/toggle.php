<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit();
}

try {
    // Récupérer les données JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['control']) || !isset($input['state'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Données manquantes']);
        exit();
    }
    
    $control = $input['control'];
    $state = (bool)$input['state'];
    
    // Valider le type de contrôle
    $validControls = ['watering', 'ventilation', 'lighting', 'heating'];
    if (!in_array($control, $validControls)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Type de contrôle invalide']);
        exit();
    }
    
    // Charger le statut actuel
    $statusFile = '../data/controls_status.json';
    $controlsStatus = [
        'watering' => false,
        'ventilation' => false,
        'lighting' => false,
        'heating' => false
    ];
    
    if (file_exists($statusFile)) {
        $savedStatus = json_decode(file_get_contents($statusFile), true);
        if ($savedStatus) {
            $controlsStatus = array_merge($controlsStatus, $savedStatus);
        }
    }
    
    // Mettre à jour le statut
    $controlsStatus[$control] = $state;
    
    // Créer le dossier data s'il n'existe pas
    $dataDir = '../data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Sauvegarder le nouveau statut
    file_put_contents($statusFile, json_encode($controlsStatus, JSON_PRETTY_PRINT));
    
    // Log de l'action
    $logMessage = date('Y-m-d H:i:s') . " - Contrôle {$control} " . ($state ? 'activé' : 'désactivé') . "\n";
    file_put_contents('../data/controls.log', $logMessage, FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'message' => "Contrôle {$control} " . ($state ? 'activé' : 'désactivé') . " avec succès",
        'data' => $controlsStatus,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la mise à jour du contrôle: ' . $e->getMessage()
    ]);
}
?> 