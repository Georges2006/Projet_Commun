<?php
require_once __DIR__ . '/config/cors.php';

// Page d'accueil de l'API
$endpoints = [
    'sensors' => [
        'GET /api/sensors/data' => 'Récupérer les données des capteurs',
        'GET /api/sensors/current' => 'Récupérer les valeurs actuelles',
        'GET /api/sensors/history?period=24h|7d|30d' => 'Récupérer l\'historique'
    ],
    'users' => [
        'GET /api/users' => 'Récupérer la liste des utilisateurs'
    ],
    'controls' => [
        'GET /api/controls/status' => 'Récupérer le statut des contrôles',
        'POST /api/controls/toggle' => 'Basculer un contrôle'
    ],
    'weather' => [
        'GET /api/weather' => 'Récupérer les données météo'
    ]
];

echo json_encode([
    'success' => true,
    'message' => 'API SerreConnect - Backend PHP',
    'version' => '1.0.0',
    'endpoints' => $endpoints,
    'timestamp' => date('Y-m-d H:i:s')
]);
?> 