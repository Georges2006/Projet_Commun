<?php
require_once __DIR__ . '/../config/cors.php';

// Configuration de l'API météo
$apiKey = '1b53202d664e697039675705a45405fd'; // Remplacez par votre clé
$city = 'Paris';
$countryCode = 'FR';

try {
    // URL de l'API OpenWeatherMap
    $url = "http://api.openweathermap.org/data/2.5/weather?q={$city},{$countryCode}&appid={$apiKey}&units=metric&lang=fr";
    
    // Faire la requête à l'API
    $response = file_get_contents($url);
    
    if ($response === false) {
        throw new Exception('Impossible de récupérer les données météo');
    }
    
    $weatherData = json_decode($response, true);
    
    if (!$weatherData || isset($weatherData['error'])) {
        throw new Exception('Erreur dans la réponse de l\'API météo');
    }
    
    // Formater les données
    $formattedData = [
        'temp' => round($weatherData['main']['temp']),
        'humidity' => $weatherData['main']['humidity'],
        'pressure' => $weatherData['main']['pressure'],
        'wind_speed' => round($weatherData['wind']['speed'] * 3.6), // Convertir m/s en km/h
        'description' => $weatherData['weather'][0]['description'],
        'icon' => $weatherData['weather'][0]['icon'],
        'city' => $weatherData['name'],
        'country' => $weatherData['sys']['country']
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $formattedData,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    // En cas d'erreur, retourner des données simulées
    $simulatedData = [
        'temp' => rand(15, 25),
        'humidity' => rand(60, 85),
        'pressure' => rand(1000, 1020),
        'wind_speed' => rand(5, 20),
        'description' => 'Données simulées',
        'icon' => '01d',
        'city' => 'Paris',
        'country' => 'FR'
    ];
    
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération des données météo: ' . $e->getMessage(),
        'data' => $simulatedData,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?> 