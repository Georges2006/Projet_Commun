// Gestion de l'authentification SerreConnect

// Variables globales
let currentForm = 'login'; // 'login', 'register' ou 'forgot'

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 login.js chargé avec succès');
    initializeAuth();
    setupFormSwitching();
    setupFormValidation();
    setupPasswordStrength();
});

// Initialisation de l'authentification
function initializeAuth() {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        // Rediriger vers le dashboard si déjà connecté
        window.location.href = '/dashboard.html';
        return;
    }
    
    // Afficher le formulaire de connexion par défaut
    showLoginForm();
}

// Configuration du changement de formulaire
function setupFormSwitching() {
    // Gestion des boutons de toggle
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const formType = this.dataset.form;
            if (formType === 'login') {
                showLoginForm();
            } else if (formType === 'register') {
                showRegisterForm();
            }
        });
    });
}

// Configuration de la validation des formulaires
function setupFormValidation() {
    // Formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    console.log('Login form trouvé:', !!loginForm);
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    console.log('Register form trouvé:', !!registerForm);
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Formulaire de mot de passe oublié
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    console.log('Forgot password form trouvé:', !!forgotPasswordForm);
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Formulaire de vérification d'email
    const verificationForm = document.getElementById('verificationForm');
    console.log('Verification form trouvé:', !!verificationForm);
    if (verificationForm) {
        verificationForm.addEventListener('submit', handleEmailVerification);
    }
    
    // Validation en temps réel - temporairement désactivée pour éviter les erreurs
    // setupRealTimeValidation();
}

// Configuration de la validation de la force du mot de passe
function setupPasswordStrength() {
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
    }
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', updatePasswordMatch);
    }
}

// Mise à jour de la force du mot de passe
function updatePasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthEl = document.getElementById('registerPasswordStrength');
    
    if (!strengthEl) return;
    
    const strength = validatePasswordStrength(password);
    strengthEl.textContent = `Force: ${strength.strengthText}`;
    strengthEl.className = `password-strength ${strength.strengthClass}`;
    
    updatePasswordMatch();
}

// Mise à jour de la correspondance des mots de passe
function updatePasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchEl = document.getElementById('registerPasswordMatch');
    
    if (!matchEl) return;
    
    if (confirmPassword) {
        const match = password === confirmPassword && password.length >= 8;
        matchEl.textContent = match ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas';
        matchEl.className = `password-match ${match ? 'match' : 'no-match'}`;
    } else {
        matchEl.textContent = '';
        matchEl.className = 'password-match';
    }
}

// Validation de la force du mot de passe
function validatePasswordStrength(password) {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
        .filter(Boolean).length;
    
    const strengthText = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon'][strength - 1] || 'Très faible';
    const strengthClass = ['very-weak', 'weak', 'medium', 'good', 'very-good'][strength - 1] || 'very-weak';
    
    return { strength, strengthText, strengthClass };
}

// Validation en temps réel
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (input) { // Protection contre les éléments undefined
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        }
    });
}

// Validation d'un champ
function validateField(event) {
    const field = event.target;
    if (!field) {
        return false; // Protection contre les événements undefined
    }
    
    const value = field.value.trim();
    const fieldName = field.name;
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'email':
            if (!value) {
                errorMessage = 'L\'email est requis';
                isValid = false;
            } else if (!isValidEmail(value)) {
                errorMessage = 'Format d\'email invalide';
                isValid = false;
            }
            break;
            
        case 'password':
            if (!value) {
                errorMessage = 'Le mot de passe est requis';
                isValid = false;
            } else if (value.length < 8) {
                errorMessage = 'Le mot de passe doit contenir au moins 8 caractères';
                isValid = false;
            }
            break;
            
        case 'confirmPassword':
            const passwordField = document.querySelector('input[name="password"]');
            const password = passwordField ? passwordField.value : '';
            if (!value) {
                errorMessage = 'Confirmez votre mot de passe';
                isValid = false;
            } else if (value !== password) {
                errorMessage = 'Les mots de passe ne correspondent pas';
                isValid = false;
            }
            break;
            
        case 'name':
            if (!value) {
                errorMessage = 'Le nom est requis';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Le nom doit contenir au moins 2 caractères';
                isValid = false;
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

// Afficher l'erreur d'un champ
function showFieldError(field, message) {
    if (!field || !field.parentNode) {
        return; // Protection contre les champs undefined
    }
    
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Effacer l'erreur d'un champ
function clearFieldError(field) {
    if (!field || !field.parentNode) {
        return; // Protection contre les champs undefined
    }
    
    field.classList.remove('error');
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validation d'email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Affichage du formulaire de connexion
function showLoginForm() {
    currentForm = 'login';
    
    // Masquer tous les formulaires
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Afficher le formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.style.display = 'block';
    
    // Mettre à jour les boutons de toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.display = 'inline-block';
    });
    document.querySelector('[data-form="login"]').classList.add('active');
}

// Affichage du formulaire d'inscription
function showRegisterForm() {
    currentForm = 'register';
    
    // Masquer tous les formulaires
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Afficher le formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.style.display = 'block';
    
    // Mettre à jour les boutons de toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.display = 'inline-block';
    });
    document.querySelector('[data-form="register"]').classList.add('active');
}

// Affichage du formulaire de mot de passe oublié
function showForgotPasswordForm() {
    currentForm = 'forgot';
    
    // Masquer tous les formulaires
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Afficher le formulaire de mot de passe oublié
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'block';
    
    // Masquer les boutons de toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.style.display = 'none';
    });
}

// Affichage du formulaire de vérification d'email
function showVerificationForm() {
    currentForm = 'verification';
    
    // Masquer tous les formulaires
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Afficher le formulaire de vérification
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) verificationForm.style.display = 'block';
    
    // Masquer les boutons de toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.style.display = 'none';
    });
}

// Gestion de la connexion
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validation
    if (!email || !password) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Format d\'email invalide', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Stocker le token
            if (rememberMe) {
                localStorage.setItem('authToken', data.data.id);
                localStorage.setItem('userData', JSON.stringify(data.data));
            } else {
                sessionStorage.setItem('authToken', data.data.id);
                sessionStorage.setItem('userData', JSON.stringify(data.data));
            }
            
            showNotification('Connexion réussie !', 'success');
            
            // Redirection vers le dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        showNotification('Erreur lors de la connexion', 'error');
    }
}

// Gestion de l'inscription
async function handleRegister(event) {
    event.preventDefault();
    
    console.log('🎉 Le bouton fonctionne ! Fonction handleRegister appelée');
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    console.log('Données du formulaire:', { name, email, agreeTerms });
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Format d\'email invalide', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('Vous devez accepter les conditions d\'utilisation', 'error');
        return;
    }
    
    try {
        console.log('Envoi de la requête à /api/auth/register...');
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })
        });
        
        console.log('Réponse reçue:', response.status);
        
        const data = await response.json();
        console.log('Données reçues:', data);
        
        if (data.success) {
            showNotification('Compte créé avec succès ! Veuillez vérifier votre email pour activer votre compte.', 'success');
            
            // Basculer vers le formulaire de vérification
            setTimeout(() => {
                showVerificationForm();
                // Pré-remplir l'email
                document.getElementById('verificationEmail').value = email;
            }, 2000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        showNotification('Erreur lors de l\'inscription', 'error');
    }
}

// Gestion du mot de passe oublié
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    
    // Validation
    if (!email) {
        showNotification('Veuillez entrer votre email', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Format d\'email invalide', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Retour au formulaire de connexion
            setTimeout(() => {
                showLoginForm();
            }, 3000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        showNotification('Erreur lors de l\'envoi de l\'email', 'error');
    }
}

// Gestion de la vérification d'email
async function handleEmailVerification(event) {
    event.preventDefault();
    
    const email = document.getElementById('verificationEmail').value.trim();
    const code = document.getElementById('verificationCode').value.trim();
    
    // Validation
    if (!email || !code) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Format d\'email invalide', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                code: code
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Email vérifié avec succès !', 'success');
            
            // Basculer vers le formulaire de connexion
            setTimeout(() => {
                showLoginForm();
                // Pré-remplir l'email
                document.getElementById('loginEmail').value = email;
            }, 2000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        showNotification('Erreur lors de la vérification', 'error');
    }
}

// Affichage des notifications
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationsContainer');
    if (!container) {
        console.error('Container de notifications non trouvé');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Toggle de la visibilité du mot de passe
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.error('Champ de mot de passe non trouvé:', inputId);
        return;
    }
    
    const button = input.nextElementSibling;
    if (!button) {
        console.error('Bouton de toggle non trouvé pour:', inputId);
        return;
    }
    
    const span = button.querySelector('span');
    if (!span) {
        console.error('Span non trouvé dans le bouton de toggle');
        return;
    }
    
    if (input.type === 'password') {
        input.type = 'text';
        span.textContent = '🙈';
    } else {
        input.type = 'password';
        span.textContent = '👁️';
    }
}

// Export des fonctions pour utilisation globale
window.Auth = {
    showLoginForm,
    showRegisterForm,
    showForgotPasswordForm,
    showVerificationForm,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleEmailVerification,
    showNotification,
    togglePassword
};