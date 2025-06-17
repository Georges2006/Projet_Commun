<?php
require_once(__DIR__ . '/../Model/Database.php'); 

header('Content-Type: application/json');

$pythonPath = 'C:\Users\Benoi\AppData\Local\Programs\Python\Python313\python.exe';
$scriptPath = 'C:\Users\Benoi\Documents\GitHub\Projet_Commun\Vue\Components\DataCapteur.py';

$command = escapeshellcmd("$pythonPath $scriptPath") . ' 2>&1';
$output = shell_exec($command);


$timestamp = date('Y-m-d H:i:s'); 
$dataValue = trim($output);

$response = [
    'success' => true, 
    'timestamp' => $timestamp,
    'data' => $dataValue
];

if ($dataValue === null || $dataValue === '' || strpos($dataValue, 'Erreur:') !== false || !is_numeric($dataValue)) {
    $response['success'] = false;
}

if ($response['success'] == true) {
    $ajoutReussi = addData((int)$dataValue, $timestamp);
    
    if (!$ajoutReussi) {
        $response['success'] = false; 
        $response['db_status'] = 'Erreur lors de l\'ajout en BDD.';
    } else {
        $response['db_status'] = 'Ajout en BDD réussi.';
    }
}

echo json_encode($response);
?>