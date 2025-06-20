<?php
// Router pour le serveur PHP intégré
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Supprimer le slash final
$path = rtrim($path, '/');

// Routes API
if (strpos($path, '/api') === 0) {
    // API Authentification
    if ($path === '/api/auth/register') {
        require __DIR__ . '/api/auth/register.php';
        return;
    }
    
    if ($path === '/api/auth/login') {
        require __DIR__ . '/api/auth/login.php';
        return;
    }
    
    if ($path === '/api/auth/forgot-password') {
        require __DIR__ . '/api/auth/forgot-password.php';
        return;
    }
    
    if ($path === '/api/auth/reset-password') {
        require __DIR__ . '/api/auth/reset-password.php';
        return;
    }
    
    if ($path === '/api/auth/logout') {
        require __DIR__ . '/api/auth/logout.php';
        return;
    }
    
    // API Capteurs
    if ($path === '/api/sensors/data') {
        require __DIR__ . '/api/sensors/data.php';
        return;
    }
    
    if ($path === '/api/sensors/current') {
        require __DIR__ . '/api/sensors/current.php';
        return;
    }
    
    if (strpos($path, '/api/sensors/history') === 0) {
        require __DIR__ . '/api/sensors/history.php';
        return;
    }
    
    // API Utilisateurs
    if ($path === '/api/users') {
        require __DIR__ . '/api/users/index.php';
        return;
    }
    
    // API Contrôles
    if ($path === '/api/controls/status') {
        require __DIR__ . '/api/controls/status.php';
        return;
    }
    
    if ($path === '/api/controls/toggle') {
        require __DIR__ . '/api/controls/toggle.php';
        return;
    }
    
    // API Météo
    if ($path === '/api/weather') {
        require __DIR__ . '/api/weather/index.php';
        return;
    }
    
    // API Index
    if ($path === '/api') {
        require __DIR__ . '/api/index.php';
        return;
    }
}

// Routes des pages d'authentification
if ($path === '/login' || $path === '/login.html') {
    $_SERVER['REQUEST_URI'] = '/login.html';
    return false;
}

if ($path === '/register' || $path === '/register.html') {
    $_SERVER['REQUEST_URI'] = '/login.html';
    return false;
}

if ($path === '/reset-password' || $path === '/reset-password.html') {
    $_SERVER['REQUEST_URI'] = '/reset-password.html';
    return false;
}
// Route pour la page de gestion
if ($path === '/gestion' || $path === '/gestion.html') {
    $_SERVER['REQUEST_URI'] = '/gestion.html';
    return false;
}

if ($path === '/logout') {
    // Redirection vers la page de déconnexion
    header('Location: /api/auth/logout');
    exit;
}

// Route racine - redirection vers index-auth.html
if ($path === '' || $path === '/') {
    $_SERVER['REQUEST_URI'] = '/index-auth.html';
    return false;
}

// Fichiers statiques
if (is_file(__DIR__ . $path)) {
    return false; // Laisse le serveur PHP servir le fichier
}

// Si le fichier HTML existe, le servir
if (is_file(__DIR__ . $path . '.html')) {
    return false; // Laisse le serveur PHP servir le fichier
}
if ($path === '/api/auth/verify-email') {
    require __DIR__ . '/api/auth/verify-email.php';
    return;
}
// Route pour la page de gestion
if ($path === '/gestion' || $path === '/gestion.html') {
    $_SERVER['REQUEST_URI'] = '/gestion.html';
    return false;
}
// Redirection par défaut vers index-auth.html
$_SERVER['REQUEST_URI'] = '/index-auth.html';
return false;
?>