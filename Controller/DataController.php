<?php
header('Content-Type: application/json');

//A modif pour chacun
$pythonPath = 'C:\Users\Benoi\AppData\Local\Programs\Python\Python313\python.exe';
$scriptPath = 'C:\Users\Benoi\Documents\GitHub\Projet_Commun\Vue\Components\DataCapteur.py';

// Exécute commande
$command = escapeshellcmd("$pythonPath $scriptPath") . ' 2>&1';
$output = shell_exec($command);

$response = [
    'success' => true,
    'timestamp' => date('H:i:s'),
    'data' => trim($output)
];

if (empty($output) || strpos($output, 'Erreur:') !== false) {
    $response['success'] = false;
}

echo json_encode($response);
?>