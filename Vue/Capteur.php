<?php
require_once(__DIR__ . '../../Model/Database.php');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Affichage Capteur en Temps Réel</title>
    <link rel="stylesheet" href="../Vue/Styles/Capteur.css">
</head>
<body>
    <?php
        try {
            $pdo = dataBase();

        // Requête pour obtenir la structure des tables
        $sql = "
            SELECT *
            FROM humidity
        ";

        // Exécution
        $stmt = $pdo->query($sql);

        // Affichage des résultats
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<strong>{$row['id']}</strong> | {$row['val']} | {$row['created_at']}<br>";
        }

    } catch (PDOException $e) {
        echo "Erreur : " . $e->getMessage();
    }
    ?>
    
    <h1>Données du capteur</h1>
    <div id="data-container">
        Chargement des données...
    </div>
    <p id="last-update">Dernière mise à jour : Jamais</p>

</body>
<script src="../Vue/Components/Capteur.js"></script>
</html>