// Dashboard SerreConnect - Gestion des données en temps réel

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

// Variables globales
let sensorData = {
    temperature: { value: 24.5, unit: '°C', history: [] },
    humidity: { value: 65, unit: '%', history: [] },
    light: { value: 850, unit: 'lux', history: [] }
};

let weatherData = {
    temperature: 22,
    humidity: 60,
    condition: 'Ensoleillé',
    icon: '☀️',
    forecast: []
};

let alerts = [
    { id: 1, type: 'warning', message: 'Humidité élevée détectée', time: '2 min ago', active: true },
    { id: 2, type: 'info', message: 'Système d\'irrigation activé', time: '5 min ago', active: false },
    { id: 3, type: 'success', message: 'Température optimale atteinte', time: '10 min ago', active: false }
];

let controls = {
    irrigation: { active: false, mode: 'auto' },
    ventilation: { active: true, mode: 'auto' },
    lighting: { active: false, mode: 'manual' }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeDashboard();
    loadRealData();
});

// Vérification de l'authentification
function checkAuth() {
    if (!window.Auth || !window.Auth.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
}

// Initialisation du dashboard
function initializeDashboard() {
    setupCharts();
    setupControls();
    setupAlerts();
    setupRefreshButton();
    updateDisplay();
}

// Configuration des graphiques
// Configuration des graphiques
function setupCharts() {
    // Graphique de température
    const tempChart = document.getElementById('tempChart');
    if (tempChart) {
        tempChart.innerHTML = `
                <div class="chart-title">Température (24h)</div>
                    <canvas id="tempChartCanvas"></canvas>
        `;
        
        const tempCtx = document.getElementById('tempChartCanvas').getContext('2d');
        window.tempChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Température (°C)',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }
    
    // Graphique d'humidité
    const humidityChart = document.getElementById('humidityChart');
    if (humidityChart) {
        humidityChart.innerHTML = `
                <div class="chart-title">Humidité (24h)</div>
                    <canvas id="humidityChartCanvas"></canvas>
        `;
        
        const humidityCtx = document.getElementById('humidityChartCanvas').getContext('2d');
        window.humidityChart = new Chart(humidityCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Humidité (%)',
                    data: [],
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }
    
    // Graphique de luminosité
    const lightChart = document.getElementById('lightChart');
    if (lightChart) {
        lightChart.innerHTML = `
                <div class="chart-title">Luminosité (24h)</div>
                    <canvas id="lightChartCanvas"></canvas>
        `;
        
        const lightCtx = document.getElementById('lightChartCanvas').getContext('2d');
        window.lightChart = new Chart(lightCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Luminosité (lux)',
                    data: [],
                    borderColor: '#ffe66d',
                    backgroundColor: 'rgba(255, 230, 109, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }
}

// Mise à jour des graphiques
function updateCharts() {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Mise à jour température
    if (window.tempChart) {
        window.tempChart.data.labels.push(timeLabel);
        window.tempChart.data.datasets[0].data.push(sensorData.temperature.value);
        
        // Garder seulement les 24 dernières valeurs (une par heure)
        if (window.tempChart.data.labels.length > 24) {
            window.tempChart.data.labels.shift();
            window.tempChart.data.datasets[0].data.shift();
        }
        
        window.tempChart.update('none');
    }
    
    // Mise à jour humidité
    if (window.humidityChart) {
        window.humidityChart.data.labels.push(timeLabel);
        window.humidityChart.data.datasets[0].data.push(sensorData.humidity.value);
        
        if (window.humidityChart.data.labels.length > 24) {
            window.humidityChart.data.labels.shift();
            window.humidityChart.data.datasets[0].data.shift();
        }
        
        window.humidityChart.update('none');
    }
    
    // Mise à jour luminosité
    if (window.lightChart) {
        window.lightChart.data.labels.push(timeLabel);
        window.lightChart.data.datasets[0].data.push(sensorData.light.value);
        
        if (window.lightChart.data.labels.length > 24) {
            window.lightChart.data.labels.shift();
            window.lightChart.data.datasets[0].data.shift();
        }
        
        window.lightChart.update('none');
    }
}

// Configuration des contrôles
function setupControls() {
    // Contrôle d'irrigation
    const irrigationToggle = document.getElementById('irrigationToggle');
    const irrigationMode = document.getElementById('irrigationMode');
    
    if (irrigationToggle) {
        irrigationToggle.addEventListener('change', function() {
            controls.irrigation.active = this.checked;
            updateControlStatus('irrigation', this.checked);
        });
    }
    
    if (irrigationMode) {
        irrigationMode.addEventListener('change', function() {
            controls.irrigation.mode = this.value;
            updateControlMode('irrigation', this.value);
        });
    }
    
    // Contrôle de ventilation
    const ventilationToggle = document.getElementById('ventilationToggle');
    const ventilationMode = document.getElementById('ventilationMode');
    
    if (ventilationToggle) {
        ventilationToggle.addEventListener('change', function() {
            controls.ventilation.active = this.checked;
            updateControlStatus('ventilation', this.checked);
        });
    }
    
    if (ventilationMode) {
        ventilationMode.addEventListener('change', function() {
            controls.ventilation.mode = this.value;
            updateControlMode('ventilation', this.value);
        });
    }
    
    // Contrôle d'éclairage
    const lightingToggle = document.getElementById('lightingToggle');
    const lightingMode = document.getElementById('lightingMode');
    
    if (lightingToggle) {
        lightingToggle.addEventListener('change', function() {
            controls.lighting.active = this.checked;
            updateControlStatus('lighting', this.checked);
        });
    }
    
    if (lightingMode) {
        lightingMode.addEventListener('change', function() {
            controls.lighting.mode = this.value;
            updateControlMode('lighting', this.value);
        });
    }
}

// Configuration des alertes
function setupAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    if (alertsContainer) {
        updateAlertsDisplay();
    }
}

// Configuration du bouton de rafraîchissement
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('loading');
            loadRealData().finally(() => {
                this.classList.remove('loading');
            });
        });
    }
}

// Chargement des données réelles
async function loadRealData() {
    try {
        // Charger les données des capteurs depuis MySQL
        await loadSensorData();
        
        // Charger les données météo depuis PostgreSQL
        await loadWeatherData();
        
        // Charger les alertes
        await loadAlerts();
        
        // Mettre à jour l'affichage
        updateDisplay();
        
        // Afficher une notification de succès
        if (window.Auth && window.Auth.showNotification) {
            window.Auth.showNotification('success', 'Données mises à jour', 'Les données ont été actualisées avec succès');
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        
        if (window.Auth && window.Auth.showNotification) {
            window.Auth.showNotification('error', 'Erreur de chargement', 'Impossible de charger les données. Vérifiez votre connexion.');
        }
    }
}

// Chargement des données des capteurs depuis MySQL
async function loadSensorData() {
    try {
        console.log('=== LOAD SENSOR DATA ===');
        console.log('Before API call - sensorData:', sensorData);
        
        const response = await fetch('/api/sensors/current', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Sensor API response:', result);
            
            if (result.success && result.data) {
                console.log('API data received:', result.data);
                
                // Mettre à jour les données des capteurs
                if (result.data.humidity !== undefined) {
                    console.log('Updating humidity from', sensorData.humidity.value, 'to', result.data.humidity);
                    sensorData.humidity.value = result.data.humidity;
                }
                if (result.data.temperature !== undefined) {
                    console.log('Updating temperature from', sensorData.temperature.value, 'to', result.data.temperature);
                    sensorData.temperature.value = result.data.temperature;
                }
                if (result.data.light !== undefined) {
                    console.log('Updating light from', sensorData.light.value, 'to', result.data.light);
                    sensorData.light.value = result.data.light;
                }
                
                console.log('After update - sensorData:', sensorData);
            }
        } else {
            console.error('Sensor API error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données des capteurs:', error);
    }
}

async function loadWeatherData() {
    try {
        // Appel API vers OpenWeatherMap - utiliser l'endpoint correct
        const response = await fetch('/api/weather', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        console.log('=== DEBUG WEATHER ===');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Weather API response:', result);
            
            if (result.success && result.data) {
                console.log('Weather data:', result.data);
                
                weatherData = {
                    temperature: result.data.temp || 22,
                    humidity: result.data.humidity || 60,
                    pressure: result.data.pressure || 1013,
                    windSpeed: result.data.wind_speed || 0,
                    condition: result.data.description || 'Ensoleillé',
                    icon: getWeatherIcon(result.data.icon) || '☀️',
                    city: result.data.city || 'Paris',
                    forecast: []
                };
                
                console.log('Processed weather data:', weatherData);
            }
        } else {
            console.error('Weather API error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Weather API exception:', error);
    }
}
// Fonction pour convertir les icônes OpenWeatherMap
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '☀️';
}

// Chargement des alertes
async function loadAlerts() {
    try {
        // Simulation d'appel API pour les alertes
        const response = await fetch('/api/alerts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            alerts = data.alerts || alerts;
        }
    } catch (error) {
        console.warn('Impossible de charger les alertes:', error);
    }
}

// Mise à jour de l'affichage
function updateDisplay() {
    updateSensorValues();
    updateWeatherInfo();
    updateAlertsDisplay();
    updateControlStatus();
    updateCharts(); // Ajoute cette ligne
}
// Calculer la tendance entre deux valeurs
function calculateTrend(currentValue, previousValue) {
    const difference = currentValue - previousValue;
    const absDifference = Math.abs(difference);
    
    if (Math.abs(difference) < 0.1) {
        return { direction: 'stable', text: '→ 0', class: 'trend-stable' };
    } else if (difference > 0) {
        return { direction: 'up', text: `↗ +${absDifference.toFixed(1)}`, class: 'trend-up' };
    } else {
        return { direction: 'down', text: `↘ -${absDifference.toFixed(1)}`, class: 'trend-down' };
    }
}

// Mettre à jour les tendances
function updateTrends() {
    console.log('=== UPDATE TRENDS ===');
    
    // Récupérer les valeurs précédentes (stockées dans l'historique ou localStorage)
    const previousData = JSON.parse(localStorage.getItem('previousSensorData')) || {
        humidity: sensorData.humidity.value,
        temperature: sensorData.temperature.value,
        light: sensorData.light.value
    };
    
    console.log('Previous data:', previousData);
    console.log('Current data:', {
        humidity: sensorData.humidity.value,
        temperature: sensorData.temperature.value,
        light: sensorData.light.value
    });
    
    // Calculer et afficher les tendances
    const humidityTrend = document.getElementById('humidityTrend');
    const temperatureTrend = document.getElementById('temperatureTrend');
    const lightTrend = document.getElementById('lightTrend');
    
    if (humidityTrend) {
        const trend = calculateTrend(sensorData.humidity.value, previousData.humidity);
        humidityTrend.textContent = trend.text;
        humidityTrend.className = `sensor-trend ${trend.class}`;
        console.log('Humidity trend:', trend);
    }
    
    if (temperatureTrend) {
        const trend = calculateTrend(sensorData.temperature.value, previousData.temperature);
        temperatureTrend.textContent = trend.text;
        temperatureTrend.className = `sensor-trend ${trend.class}`;
        console.log('Temperature trend:', trend);
    }
    
    if (lightTrend) {
        const trend = calculateTrend(sensorData.light.value, previousData.light);
        lightTrend.textContent = trend.text;
        lightTrend.className = `sensor-trend ${trend.class}`;
        console.log('Light trend:', trend);
    }
    
    // Sauvegarder les valeurs actuelles pour la prochaine comparaison
    localStorage.setItem('previousSensorData', JSON.stringify({
        humidity: sensorData.humidity.value,
        temperature: sensorData.temperature.value,
        light: sensorData.light.value
    }));
}
// Mise à jour des valeurs des capteurs
function updateSensorValues() {
    console.log('=== UPDATE SENSOR VALUES ===');
    console.log('Current sensorData:', sensorData);
    
    const tempValue = document.getElementById('temperatureValue');
    const humidityValue = document.getElementById('humidityValue');
    const lightValue = document.getElementById('lightValue');
    
    console.log('Found elements:', {
        tempValue: !!tempValue,
        humidityValue: !!humidityValue,
        lightValue: !!lightValue
    });
    
    if (tempValue) {
        const newText = `${sensorData.temperature.value}${sensorData.temperature.unit}`;
        console.log('Setting temperature to:', newText);
        tempValue.textContent = newText;
        console.log('Temperature element after update:', tempValue.textContent);
    } else {
        console.error('temperatureValue element not found!');
    }
    
    if (humidityValue) {
        const newText = `${sensorData.humidity.value}${sensorData.humidity.unit}`;
        console.log('Setting humidity to:', newText);
        humidityValue.textContent = newText;
    }
    
    if (lightValue) {
        const newText = `${sensorData.light.value} ${sensorData.light.unit}`;
        console.log('Setting light to:', newText);
        lightValue.textContent = newText;
    }
    
    // Mettre à jour les tendances après avoir mis à jour les valeurs
    updateTrends();
}

// Mise à jour des informations météo
function updateWeatherInfo() {
    console.log('=== UPDATE WEATHER INFO ===');
    console.log('Current weatherData:', weatherData);
    
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherCondition = document.getElementById('weatherCondition');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherHumidity = document.getElementById('weatherHumidity');
    const weatherWind = document.getElementById('weatherWind');
    const weatherPressure = document.getElementById('weatherPressure');
    
    console.log('Found elements:', {
        weatherTemp: !!weatherTemp,
        weatherCondition: !!weatherCondition,
        weatherIcon: !!weatherIcon,
        weatherHumidity: !!weatherHumidity,
        weatherWind: !!weatherWind,
        weatherPressure: !!weatherPressure
    });
    
    if (weatherTemp) {
        weatherTemp.textContent = `${weatherData.temperature}°C`;
        console.log('Updated temperature:', weatherTemp.textContent);
    }
    
    if (weatherCondition) {
        weatherCondition.textContent = weatherData.condition;
        console.log('Updated condition:', weatherCondition.textContent);
    }
    
    if (weatherIcon) {
        weatherIcon.textContent = weatherData.icon;
        console.log('Updated icon:', weatherIcon.textContent);
    }
    
    if (weatherHumidity) {
        weatherHumidity.textContent = `${weatherData.humidity}%`;
        console.log('Updated humidity:', weatherHumidity.textContent);
    }
    
    if (weatherWind) {
        weatherWind.textContent = `${weatherData.windSpeed} km/h`;
        console.log('Updated wind:', weatherWind.textContent);
    }
    
    if (weatherPressure) {
        weatherPressure.textContent = `${weatherData.pressure} hPa`;
        console.log('Updated pressure:', weatherPressure.textContent);
    }
}

// Mise à jour de l'affichage des alertes
function updateAlertsDisplay() {
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;
    
    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type} ${alert.active ? 'active' : ''}">
            <div class="alert-icon">
                ${alert.type === 'warning' ? '⚠️' : alert.type === 'error' ? '❌' : alert.type === 'success' ? '✅' : 'ℹ️'}
            </div>
            <div class="alert-content">
                <div class="alert-message">${alert.message}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
            <button class="alert-close" onclick="dismissAlert(${alert.id})">×</button>
        </div>
    `).join('');
}

// Mise à jour du statut des contrôles
function updateControlStatus() {
    // Irrigation
    const irrigationToggle = document.getElementById('irrigationToggle');
    const irrigationStatus = document.getElementById('irrigationStatus');
    
    if (irrigationToggle) {
        irrigationToggle.checked = controls.irrigation.active;
    }
    
    if (irrigationStatus) {
        irrigationStatus.textContent = controls.irrigation.active ? 'Actif' : 'Inactif';
        irrigationStatus.className = `status ${controls.irrigation.active ? 'active' : 'inactive'}`;
    }
    
    // Ventilation
    const ventilationToggle = document.getElementById('ventilationToggle');
    const ventilationStatus = document.getElementById('ventilationStatus');
    
    if (ventilationToggle) {
        ventilationToggle.checked = controls.ventilation.active;
    }
    
    if (ventilationStatus) {
        ventilationStatus.textContent = controls.ventilation.active ? 'Actif' : 'Inactif';
        ventilationStatus.className = `status ${controls.ventilation.active ? 'active' : 'inactive'}`;
    }
    
    // Éclairage
    const lightingToggle = document.getElementById('lightingToggle');
    const lightingStatus = document.getElementById('lightingStatus');
    
    if (lightingToggle) {
        lightingToggle.checked = controls.lighting.active;
    }
    
    if (lightingStatus) {
        lightingStatus.textContent = controls.lighting.active ? 'Actif' : 'Inactif';
        lightingStatus.className = `status ${controls.lighting.active ? 'active' : 'inactive'}`;
    }
}

// Mise à jour du statut d'un contrôle spécifique
function updateControlStatus(control, active) {
    const statusElement = document.getElementById(`${control}Status`);
    if (statusElement) {
        statusElement.textContent = active ? 'Actif' : 'Inactif';
        statusElement.className = `status ${active ? 'active' : 'inactive'}`;
    }
}

// Mise à jour du mode d'un contrôle
function updateControlMode(control, mode) {
    console.log(`${control} mode changed to: ${mode}`);
    // Ici vous pouvez ajouter la logique pour changer le mode du contrôle
}

// Fermer une alerte
function dismissAlert(alertId) {
    alerts = alerts.filter(alert => alert.id !== alertId);
    updateAlertsDisplay();
}

// Export des fonctions pour utilisation globale
window.Dashboard = {
    loadRealData,
    updateDisplay,
    dismissAlert
};