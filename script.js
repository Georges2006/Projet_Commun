// Script principal pour la page d'accueil SerreConnect

// Configuration des bases de données
const DB_CONFIG = {
    mysql: {
        host: '185.216.26.53',
        user: 'g1a',
        password: 'azertyg1a',
        database: 'serre_connectee'
    },
    postgresql: {
        host: 'localhost',
        user: 'postgres',
        password: 'pass',
        database: 'serre_connectee'
    }
};

// Configuration de l'API météo
const WEATHER_API_KEY = 'YOUR_GOOGLE_WEATHER_API_KEY'; // À remplacer par votre clé API

// Variables globales
let sensorData = {
    temperature: { value: 24.5, unit: '°C' },
    humidity: { value: 65, unit: '%' },
    light: { value: 850, unit: 'lux' }
};

let weatherData = {
    temperature: 22,
    humidity: 60,
    condition: 'Ensoleillé',
    icon: '☀️'
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadRealData();
});

// Initialisation de la page
function initializePage() {
    // Animation des cartes flottantes
    animateFloatingCards();
    
    // Gestion du smooth scroll pour la navigation
    setupSmoothScroll();
    
    // Animation des statistiques
    animateStats();
    
    // Gestion du formulaire de contact
    setupContactForm();
}

// Animation des cartes flottantes
function animateFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('animate-float');
    });
}

// Configuration du smooth scroll
function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation des statistiques
function animateStats() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                const finalValue = statNumber.textContent;
                
                // Animation du compteur
                animateCounter(statNumber, finalValue);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });
}

// Animation du compteur
function animateCounter(element, finalValue) {
    const isPercentage = finalValue.includes('%');
    const isTime = finalValue.includes('/');
    const isPlus = finalValue.includes('+');
    const isMinus = finalValue.includes('-');
    
    let numericValue = parseFloat(finalValue.replace(/[^\d.-]/g, ''));
    let startValue = 0;
    let prefix = '';
    let suffix = '';
    
    if (isPlus) {
        prefix = '+';
        startValue = 0;
    } else if (isMinus) {
        prefix = '-';
        startValue = 0;
    } else if (isPercentage) {
        suffix = '%';
        startValue = 0;
    } else if (isTime) {
        suffix = '/7';
        startValue = 0;
    }
    
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (numericValue - startValue) * progress;
        
        if (isTime) {
            element.textContent = Math.floor(currentValue) + suffix;
        } else {
            element.textContent = prefix + Math.floor(currentValue) + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Configuration du formulaire de contact
function setupContactForm() {
    const form = document.querySelector('.contact-form form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const name = formData.get('name') || form.querySelector('input[type="text"]').value;
            const email = formData.get('email') || form.querySelector('input[type="email"]').value;
            const message = formData.get('message') || form.querySelector('textarea').value;
            
            // Simulation d'envoi
            showNotification('success', 'Message envoyé', 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
            
            // Réinitialisation du formulaire
            form.reset();
        });
    }
}

// Chargement des données réelles
async function loadRealData() {
    try {
        // Charger les données des capteurs
        await loadSensorData();
        
        // Charger les données météo
        await loadWeatherData();
        
        // Mettre à jour l'affichage
        updateDisplay();
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Utiliser les données par défaut en cas d'erreur
        updateDisplay();
    }
}

// Chargement des données des capteurs depuis MySQL
async function loadSensorData() {
    try {
        // Simulation d'appel API vers la base MySQL
        const response = await fetch('/api/sensors/latest', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            sensorData = {
                temperature: { value: data.temperature?.val || 24.5, unit: '°C' },
                humidity: { value: data.humidity?.val || 65, unit: '%' },
                light: { value: data.light?.val || 850, unit: 'lux' }
            };
        }
    } catch (error) {
        console.warn('Impossible de charger les données des capteurs, utilisation des données par défaut');
    }
}

// Chargement des données météo depuis l'API Google Weather
async function loadWeatherData() {
    try {
        if (WEATHER_API_KEY === 'YOUR_GOOGLE_WEATHER_API_KEY') {
            // Utiliser des données simulées si pas de clé API
            weatherData = {
                temperature: 22,
                humidity: 60,
                condition: 'Ensoleillé',
                icon: '☀️'
            };
            return;
        }
        
        // Simulation d'appel à l'API météo
        const response = await fetch(`/api/weather/current`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            weatherData = {
                temperature: data.temperature || 22,
                humidity: data.humidity || 60,
                condition: data.condition || 'Ensoleillé',
                icon: data.icon || '☀️'
            };
        }
    } catch (error) {
        console.warn('Impossible de charger les données météo, utilisation des données par défaut');
    }
}

// Mise à jour de l'affichage
function updateDisplay() {
    // Mise à jour des valeurs des capteurs
    const tempValue = document.getElementById('tempValue');
    const humidityValue = document.getElementById('humidityValue');
    const lightValue = document.getElementById('lightValue');
    
    if (tempValue) {
        tempValue.textContent = `${sensorData.temperature.value}${sensorData.temperature.unit}`;
    }
    
    if (humidityValue) {
        humidityValue.textContent = `${sensorData.humidity.value}${sensorData.humidity.unit}`;
    }
    
    if (lightValue) {
        lightValue.textContent = `${sensorData.light.value} ${sensorData.light.unit}`;
    }
}

// Fonction utilitaire pour afficher les notifications
function showNotification(type, title, message) {
    if (window.Auth && window.Auth.showNotification) {
        window.Auth.showNotification(type, title, message);
    } else {
        // Fallback simple
        alert(`${title}: ${message}`);
    }
}

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Gestion des erreurs de réseau
window.addEventListener('offline', function() {
    showNotification('warning', 'Connexion perdue', 'Vérifiez votre connexion internet');
});

window.addEventListener('online', function() {
    showNotification('success', 'Connexion rétablie', 'Votre connexion internet est de nouveau active');
});

// Export des fonctions pour utilisation globale
window.SerreConnect = {
    loadRealData,
    updateDisplay,
    showNotification
};