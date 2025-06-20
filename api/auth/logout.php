<?php
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

session_start();

// Destruction de la session
session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Déconnexion réussie'
]);
?>