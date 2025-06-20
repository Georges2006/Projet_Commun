<?php
// Configuration des bases de données
class Database {
    private static $mysql_connection;
    private static $postgres_connection;

    // Configuration MySQL (capteurs)
    private static function getMySQLConfig() {
        return [
            'host' => $_ENV['MYSQL_HOST'] ?? '185.216.26.53',
            'user' => $_ENV['MYSQL_USER'] ?? 'g1a',
            'password' => $_ENV['MYSQL_PASSWORD'] ?? 'azertyg1a',
            'database' => $_ENV['MYSQL_DB'] ?? 'serre_connectee',
            'charset' => 'utf8mb4'
        ];
    }

    // Configuration PostgreSQL (utilisateurs)
    private static function getPostgresConfig() {
        return [
            'host' => $_ENV['POSTGRES_HOST'] ?? 'postgres',
            'user' => $_ENV['POSTGRES_USER'] ?? 'postgres',
            'password' => $_ENV['POSTGRES_PASSWORD'] ?? 'password',
            'database' => $_ENV['POSTGRES_DB'] ?? 'serreconnect',
            'port' => 5432
        ];
    }

    // Connexion MySQL
    public static function getMySQLConnection() {
        if (!isset(self::$mysql_connection)) {
            try {
                $config = self::getMySQLConfig();
                $dsn = "mysql:host=" . $config['host'] . 
                       ";dbname=" . $config['database'] . 
                       ";charset=" . $config['charset'];
                
                self::$mysql_connection = new PDO($dsn, 
                    $config['user'], 
                    $config['password'],
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]
                );
            } catch (PDOException $e) {
                error_log("Erreur connexion MySQL: " . $e->getMessage());
                throw new Exception("Impossible de se connecter à la base MySQL");
            }
        }
        return self::$mysql_connection;
    }

    // Connexion PostgreSQL
    public static function getPostgresConnection() {
        if (!isset(self::$postgres_connection)) {
            try {
                $config = self::getPostgresConfig();
                $dsn = "pgsql:host=" . $config['host'] . 
                       ";port=" . $config['port'] . 
                       ";dbname=" . $config['database'];
                
                self::$postgres_connection = new PDO($dsn, 
                    $config['user'], 
                    $config['password'],
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]
                );
            } catch (PDOException $e) {
                error_log("Erreur connexion PostgreSQL: " . $e->getMessage());
                throw new Exception("Impossible de se connecter à la base PostgreSQL");
            }
        }
        return self::$postgres_connection;
    }

    // Fermer les connexions
    public static function closeConnections() {
        self::$mysql_connection = null;
        self::$postgres_connection = null;
    }
}
?>