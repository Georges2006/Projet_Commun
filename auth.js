// Gestion de l'authentification globale SerreConnect

// Variables globales
let currentUser = null;
let isAuthenticated = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    updateNavigation();
    
    // Vérification pour les pages protégées
    const protectedPages = ['/dashboard', '/gestion'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.includes(currentPath)) {
        checkAuth();
    }
});

// Vérification de l'authentification pour les pages protégées
function checkAuth() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        // Rediriger vers la page de connexion
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Vérification du statut d'authentification
function checkAuthStatus() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            isAuthenticated = true;
        } catch (error) {
            console.error('Erreur lors du parsing des données utilisateur:', error);
            clearAuthData();
        }
    }
}

// Mise à jour de la navigation selon l'authentification
function updateNavigation() {
    const authLink = document.getElementById('authLink');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (isAuthenticated && currentUser) {
        // Utilisateur connecté
        if (authLink) {
            authLink.innerHTML = `
                <span>👤</span>
                <span>${currentUser.name}</span>
            `;
            authLink.href = '#';
            authLink.onclick = showUserMenu;
        }
        
        if (dashboardBtn) {
            dashboardBtn.style.display = 'flex';
        }
        
        // Affichage des éléments admin si nécessaire
        if (currentUser.role === 'admin') {
            adminElements.forEach(el => {
                el.style.display = 'block';
            });
        }
        
    } else {
        // Utilisateur non connecté
        if (authLink) {
            authLink.innerHTML = '<span>🔐</span><span>Connexion</span>';
            authLink.href = '/login.html';
            authLink.onclick = null;
        }
        
        if (dashboardBtn) {
            dashboardBtn.style.display = 'none';
        }
        
        // Masquer les éléments admin
        adminElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Affichage du menu utilisateur
function showUserMenu(event) {
    event.preventDefault();
    
    // Supprimer l'ancien menu s'il existe
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Créer le menu utilisateur
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-menu-header">
            <span class="user-avatar">${currentUser.avatar || '👤'}</span>
            <div class="user-info">
                <div class="user-name">${currentUser.name}</div>
                <div class="user-role">${currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</div>
            </div>
        </div>
        <div class="user-menu-items">
            <a href="/dashboard.html" class="user-menu-item">
                <span>📊</span>
                <span>Dashboard</span>
            </a>
            ${currentUser.role === 'admin' ? `
                <a href="/gestion.html" class="user-menu-item">
                    <span>⚙️</span>
                    <span>Gestion</span>
                </a>
            ` : ''}
            <a href="/profile.html" class="user-menu-item">
                <span>👤</span>
                <span>Profil</span>
            </a>
            <button class="user-menu-item logout-btn" onclick="logout()">
                <span>🚪</span>
                <span>Déconnexion</span>
            </button>
        </div>
    `;
    
    // Positionner le menu
    const authLink = document.getElementById('authLink');
    const rect = authLink.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = rect.bottom + 10 + 'px';
    menu.style.right = '1rem';
    menu.style.zIndex = '1000';
    
    // Ajouter le menu au DOM
    document.body.appendChild(menu);
    
    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !authLink.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Déconnexion
function logout() {
    clearAuthData();
    updateNavigation();
    
    // Redirection vers la page d'accueil
    window.location.href = '/index-auth.html';
    
    // Notification de déconnexion
    showNotification('success', 'Déconnexion', 'Vous avez été déconnecté avec succès');
}

// Nettoyage des données d'authentification
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    currentUser = null;
    isAuthenticated = false;
}

// Vérification des permissions
function checkPermission(requiredRole) {
    if (!isAuthenticated || !currentUser) {
        return false;
    }
    
    if (requiredRole === 'admin') {
        return currentUser.role === 'admin';
    }
    
    return true; // Les utilisateurs normaux ont accès aux fonctionnalités de base
}

// Protection des pages admin
function protectAdminPage() {
    if (!checkPermission('admin')) {
        showNotification('error', 'Accès refusé', 'Vous devez être administrateur pour accéder à cette page');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        return false;
    }
    return true;
}

// Affichage des notifications
function showNotification(type, title, message) {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'}</span>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export des fonctions pour utilisation globale
window.Auth = {
    isAuthenticated: () => isAuthenticated,
    currentUser: () => currentUser,
    checkPermission,
    protectAdminPage,
    clearAuthData,
    logout,
    showNotification,
    checkAuth
};

// Styles CSS pour le menu utilisateur
const userMenuStyles = `
<style>
.user-menu {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    min-width: 250px;
    overflow: hidden;
}

.user-menu-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-avatar {
    font-size: 2rem;
}

.user-info {
    flex: 1;
}

.user-name {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.user-role {
    font-size: 0.875rem;
    color: #6b7280;
}

.user-menu-items {
    padding: 0.5rem;
}

.user-menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: #374151;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-size: 0.875rem;
}

.user-menu-item:hover {
    background: #f3f4f6;
    color: #1f2937;
}

.logout-btn {
    color: #dc2626;
}

.logout-btn:hover {
    background: #fef2f2;
    color: #dc2626;
}

.notifications-container {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 1000;
}

.notification {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    border-left: 4px solid;
    min-width: 300px;
    animation: slideInRight 0.3s ease-out;
}

.notification.success {
    border-left-color: #22c55e;
}

.notification.error {
    border-left-color: #ef4444;
}

.notification.warning {
    border-left-color: #f59e0b;
}

.notification-icon {
    font-size: 1.25rem;
}

.notification-content {
    flex: 1;
}

.notification-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.notification-message {
    font-size: 0.875rem;
    color: #6b7280;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.7;
}

.notification-close:hover {
    opacity: 1;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
`;

// Ajouter les styles au head
document.head.insertAdjacentHTML('beforeend', userMenuStyles);