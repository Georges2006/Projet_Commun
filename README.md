# 🌱 SerreConnect - Système de Gestion de Serre Connectée

## 📋 Description

SerreConnect est une plateforme web complète pour la gestion intelligente de serres connectées. Le système permet de surveiller l'humidité des sols, la température et la luminosité en temps réel, avec des contrôles automatisés et une interface d'administration complète.

## 🏗️ Architecture

### Frontend
- **HTML5/CSS3** : Interface moderne et responsive
- **JavaScript** : Logique client avec Chart.js pour les graphiques
- **Design** : Inspiré du template Webflow avec gradients et animations

### Backend
- **PHP** : API REST avec PDO pour les connexions base de données
- **MySQL** : Stockage des données des capteurs (185.216.26.53)
- **PostgreSQL** : Gestion des utilisateurs (localhost)

## 📊 Bases de Données

### MySQL (Capteurs)
```sql
-- Tables : humidity, light, temperature
-- Structure : id, val, created_at
```

### PostgreSQL (Utilisateurs)
```sql
-- Table : users
-- Structure : id, username, password, email, created_at

-- Table : weather_data
-- Structure : id, temperature, humidity, pressure, wind_speed, timestamp
```

## 🚀 Installation

### Prérequis
- PHP 7.4+ avec extensions PDO
- Serveur web (Apache/Nginx)
- Accès aux bases de données MySQL et PostgreSQL

### Configuration
1. **Cloner le projet**
2. **Configurer les bases de données** dans `api/config/database.php`
3. **Obtenir une clé API météo** (OpenWeatherMap) et la configurer
4. **Démarrer le serveur web**

### Démarrage
```bash
# Avec PHP intégré
php -S localhost:8000

# Ou avec Apache/Nginx
# Placer les fichiers dans le répertoire web
```

## 📁 Structure du Projet

```
APPcommun/
├── index.html              # Page d'accueil
├── styles.css              # Styles de la page d'accueil
├── script.js               # JavaScript de la page d'accueil
├── dashboard.html          # Page dashboard
├── dashboard.css           # Styles du dashboard
├── dashboard.js            # JavaScript du dashboard
├── gestion.html            # Page d'administration
├── gestion.css             # Styles de l'administration
├── gestion.js              # JavaScript de l'administration
├── .htaccess               # Configuration Apache
├── README.md               # Documentation
└── api/                    # Backend PHP
    ├── config/
    │   ├── database.php    # Configuration des bases de données
    │   └── cors.php        # Configuration CORS
    ├── sensors/
    │   ├── data.php        # Données des capteurs
    │   ├── current.php     # Valeurs actuelles
    │   └── history.php     # Historique
    ├── users/
    │   └── index.php       # Gestion des utilisateurs
    ├── controls/
    │   ├── status.php      # Statut des contrôles
    │   └── toggle.php      # Basculement des contrôles
    ├── weather/
    │   └── index.php       # Données météo
    └── index.php           # Documentation API
```

## 🔌 API Endpoints

### Capteurs
- `GET /api/sensors/data` - Données complètes des capteurs
- `GET /api/sensors/current` - Valeurs actuelles
- `GET /api/sensors/history?period=24h|7d|30d` - Historique

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs

### Contrôles
- `GET /api/controls/status` - Statut des contrôles
- `POST /api/controls/toggle` - Basculer un contrôle

### Météo
- `GET /api/weather` - Données météorologiques

## 🎯 Fonctionnalités

### Page d'Accueil
- ✅ Statistiques en temps réel
- ✅ Aperçu du dashboard
- ✅ Intégration météo
- ✅ Design responsive

### Dashboard
- ✅ Surveillance temps réel
- ✅ Graphiques interactifs
- ✅ Contrôles rapides
- ✅ Données historiques
- ✅ Système d'alertes

### Administration
- ✅ Monitoring système
- ✅ Configuration capteurs
- ✅ Règles d'automatisation
- ✅ Gestion utilisateurs
- ✅ Journaux d'événements

## 🔧 Configuration

### Bases de Données
```php
// MySQL (Capteurs)
'mysql' => [
    'host' => '185.216.26.53',
    'user' => 'g1a',
    'password' => 'azertyg1a',
    'database' => 'g1a'
]

// PostgreSQL (Utilisateurs)
'postgres' => [
    'host' => 'localhost',
    'user' => 'postgres',
    'password' => 'pass',
    'database' => 'serre_connectee'
]
```

### API Météo
```php
$apiKey = 'YOUR_OPENWEATHER_API_KEY';
$city = 'Paris';
$countryCode = 'FR';
```

## 🚀 Utilisation

1. **Accéder à l'application** : http://localhost:8000
2. **Page d'accueil** : Vue d'ensemble du système
3. **Dashboard** : Surveillance et contrôles en temps réel
4. **Administration** : Gestion complète du système

## 🔒 Sécurité

- ✅ Validation des entrées
- ✅ Protection CORS
- ✅ Gestion des erreurs
- ✅ Logs d'activité
- ⚠️ Authentification à implémenter

## 📈 Évolutions Futures

- [ ] Système d'authentification
- [ ] Notifications push
- [ ] API mobile
- [ ] Intégration IoT
- [ ] Machine Learning
- [ ] Rapports avancés

## 🤝 Contribution

Projet développé pour ISEP - Gestion de projet commun.

## 📄 Licence

© 2024 SerreConnect - Projet commun ISEP 