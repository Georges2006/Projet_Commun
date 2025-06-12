<?php
// On indique au navigateur que la réponse sera du JSON
header('Content-Type: application/json');

// Chemins complets pour éviter les problèmes
$pythonPath = 'C:\Users\Benoi\AppData\Local\Programs\Python\Python313\python.exe';
$scriptPath = 'C:\Users\Benoi\Documents\GitHub\Projet_Commun\Vue\Components\DataCapteur.py';

// Exécute la commande et capture la sortie standard ET les erreurs
$command = escapeshellcmd("$pythonPath $scriptPath") . ' 2>&1';
$output = shell_exec($command);

// On prépare un tableau pour la réponse JSON
$response = [
    'success' => true,
    'timestamp' => date('H:i:s'),
    'data' => trim($output) // Nettoie la sortie
];

// Si la sortie est vide ou contient "Erreur", on ajuste la réponse
if (empty($output) || strpos($output, 'Erreur:') !== false) {
    $response['success'] = false;
}

// On encode le tableau en JSON et on l'affiche
echo json_encode($response);
?>