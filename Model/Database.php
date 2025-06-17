<?php
function dataBase(){
    try {
            $host = '185.216.26.53';
            $dbname = 'app_g1';
            $user = 'g1a';
            $pwd = 'azertyg1a';
        // Connexion à PostgreSQL
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pwd);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        echo "Erreur : " . $e->getMessage();
    }
    return $pdo;
}

function addData($value, $time){
    try {
        $pdo = dataBase();

        $sql = "INSERT INTO humidity (val, created_at) VALUES (:val, :created_at)";
        $stmt = $pdo->prepare($sql);

        $stmt->bindParam(':val', $value, PDO::PARAM_INT);
        $stmt->bindParam(':created_at', $time, PDO::PARAM_STR);

        return $stmt->execute();

    } catch (PDOException $e) {
        error_log("Erreur d'ajout BDD : " . $e->getMessage());
        return false;
    }
}

?>