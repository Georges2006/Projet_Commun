<?php
// Configuration SMTP pour SerreConnect
class SMTPConfig {
    // Configuration Gmail (à adapter selon vos besoins)
    public static $smtp_host = 'smtp.gmail.com';
    public static $smtp_port = 465;
    public static $smtp_username = 'noreply.serreconnect@gmail.com'; // À remplacer
    public static $smtp_password = 'qtbz ciaj cafq sqnm'; // À remplacer
    public static $smtp_secure = 'ssl';
    
    // Configuration de l'expéditeur
    public static $from_email = 'noreply.serreconnect@gmail.com';
    public static $from_name = 'SerreConnect';
    
    // URL de base de l'application
    public static $base_url = 'http://localhost:8000';
}
?>