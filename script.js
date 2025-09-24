// Subway line colors for visual appeal
const lineColors = {
    '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
    '4': '#00933C', '5': '#00933C', '6': '#00933C',
    '7': '#B933AD',
    'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
    'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
    'G': '#6CBE45',
    'J': '#996633', 'Z': '#996633',
    'L': '#A7A9AC',
    'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
    'S': '#808183'
};

// Enhanced simulated alert data with more realistic features
const simulatedAlerts = [
    {
        id: '1',
        title: 'Service Disruption on 4, 5, 6 Lines',
        description: 'Due to signal problems at Union Square, expect delays in both directions. Trains are operating with increased travel time of 15-20 minutes.',
        lines: ['4', '5', '6'],
        severity: 'critical',
        timestamp: new Date(Date.now() - 1800000),
        affectedStations: ['Union Sq', '14 St', 'Astor Pl'],
        estimatedResolution: new Date(Date.now() + 3600000),
        isRushHour: true,
        location: 'manhattan',
        serviceReliability: 65,
        walkingDistance: '0.3 miles'
    },
    {
        id: '2',
        title: 'Weekend Service Changes',
        description: 'L train is not running between 14 St-Union Sq and 8 Av due to planned maintenance work. Free shuttle bus service is available.',
        lines: ['L'],
        severity: 'warning',
        timestamp: new Date(Date.now() - 3600000),
        affectedStations: ['14 St-Union Sq', '8 Av', '6 Av'],
        estimatedResolution: new Date(Date.now() + 14400000),
        isRushHour: false,
        location: 'manhattan',
        serviceReliability: 45,
        walkingDistance: '0.5 miles'
    },
    {
        id: '3',
        title: 'Express Service Running Local',
        description: 'N and Q trains are running local in Manhattan due to track work. Allow extra travel time.',
        lines: ['N', 'Q'],
        severity: 'warning',
        timestamp: new Date(Date.now() - 900000),
        affectedStations: ['Times Sq', 'Herald Sq', 'Union Sq'],
        estimatedResolution: new Date(Date.now() + 7200000),
        isRushHour: true,
        location: 'manhattan',
        serviceReliability: 75,
        walkingDistance: '0.2 miles'
    },
    {
        id: '4',
        title: 'Station Accessibility Update',
        description: 'Elevator at 59 St-Columbus Circle is back in service. All station levels are now accessible.',
        lines: ['A', 'B', 'C', 'D'],
        severity: 'info',
        timestamp: new Date(Date.now() - 600000),
        affectedStations: ['59 St-Columbus Circle'],
        estimatedResolution: null,
        isRushHour: false,
        location: 'manhattan',
        serviceReliability: 95,
        walkingDistance: '0.8 miles'
    },
    {
        id: '5',
        title: 'Rush Hour Express Service',
        description: 'Additional 6 express trains are running during evening rush hours to reduce crowding.',
        lines: ['6'],
        severity: 'info',
        timestamp: new Date(Date.now() - 1200000),
        affectedStations: ['Multiple stations'],
        estimatedResolution: new Date(Date.now() + 1800000),
        isRushHour: true,
        location: 'manhattan',
        serviceReliability: 85,
        walkingDistance: '0.1 miles'
    },
    {
        id: '6',
        title: 'Brooklyn Service Alert',
        description: 'F train experiencing minor delays due to train traffic ahead. Expect 5-10 minute delays.',
        lines: ['F'],
        severity: 'warning',
        timestamp: new Date(Date.now() - 2700000),
        affectedStations: ['Jay St', 'Borough Hall', 'Court St'],
        estimatedResolution: new Date(Date.now() + 1800000),
        isRushHour: false,
        location: 'brooklyn',
        serviceReliability: 80,
        walkingDistance: '1.2 miles'
    }
];

// Global state
let currentAlerts = [];
let filteredAlerts = [];
let favoriteLines = new Set();
let soundEnabled = false;
let rushHourMode = false;
let userLocation = null;
let currentTheme = 'light';
let currentFontSize = 'normal';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadUserPreferences();
    loadAlerts();
    requestNotificationPermission();
});

function setupEventListeners() {
    document.getElementById('lineFilter').addEventListener('change', function() {
        saveUserPreferences();
        applyFilters();
    });
    document.getElementById('severityFilter').addEventListener('change', function() {
        saveUserPreferences();
        applyFilters();
    });
    document.getElementById('timeFilter').addEventListener('change', function() {
        saveUserPreferences();
        applyFilters();
    });
    document.getElementById('locationFilter').addEventListener('change', function() {
        saveUserPreferences();
        applyFilters();
    });
}

// Enhanced preference management
function saveUserPreferences() {
    const preferences = {
        lineFilter: document.getElementById('lineFilter').value,
        severityFilter: document.getElementById('severityFilter').value,
        timeFilter: document.getElementById('timeFilter').value,
        locationFilter: document.getElementById('locationFilter').value,
        favoriteLines: Array.from(favoriteLines),
        soundEnabled: soundEnabled,
        theme: currentTheme,
        fontSize: currentFontSize,
        rushHourMode: rushHourMode,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('subwayAlertsPreferences', JSON.stringify(preferences));
}

function loadUserPreferences() {
    const saved = localStorage.getItem('subwayAlertsPreferences');
    if (saved) {
        try {
            const preferences = JSON.parse(saved);
            document.getElementById('lineFilter').value = preferences.lineFilter || 'all';
            document.getElementById('severityFilter').value = preferences.severityFilter || 'all';
            document.getElementById('timeFilter').value = preferences.timeFilter || 'all';
            document.getElementById('locationFilter').value = preferences.locationFilter || 'all';
            
            favoriteLines = new Set(preferences.favoriteLines || []);
            soundEnabled = preferences.soundEnabled || false;
            currentTheme = preferences.theme || 'light';
            currentFontSize = preferences.fontSize || 'normal';
            rushHourMode = preferences.rushHourMode || false;
            
            // Apply saved preferences
            applyTheme(currentTheme);
            applySoundSettings();
            applyFontSize(currentFontSize);
            updateFavoriteLines();
            
            if (preferences.lastUpdated) {
                const lastUpdated = new Date(preferences.lastUpdated);
                const timeDiff = new Date() - lastUpdated;
                const minutesAgo = Math.floor(timeDiff / 60000);
                
                if (minutesAgo < 60) {
                    showNotification(`Settings restored from ${minutesAgo} minutes ago`, 'info');
                }
            }
        } catch (error) {
            console.log('Could not load saved preferences');
        }
    }
}

// Theme functionality
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    saveUserPreferences();
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = document.querySelector('.theme-toggle');
    toggle.textContent = theme === 'light' ? '🌙 Dark' : '☀️ Light';
}

// Font size functionality
function changeFontSize(size) {
    currentFontSize = size;
    applyFontSize(size);
    saveUserPreferences();
}

function applyFontSize(size) {
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    document.body.classList.add(`font-${size}`);
}

// Favorite lines functionality
function toggleFavoriteLine(line) {
    if (favoriteLines.has(line)) {
        favoriteLines.delete(line);
        playSound('remove');
    } else {
        favoriteLines.add(line);
        playSound('add');
    }
    updateFavoriteLines();
    saveUserPreferences();
    applyFilters();
}

function updateFavoriteLines() {
    const container = document.getElementById('favoriteLines');
    if (favoriteLines.size === 0) {
        container.innerHTML = '<span style="color: var(--text-muted); font-style: italic;">Click ⭐ on line badges to add favorites</span>';
        return;
    }
    
    container.innerHTML = Array.from(favoriteLines).map(line => `
        <div class="favorite-line">
            <span class="line-badge" style="background-color: ${lineColors[line] || '#666'}; padding: 4px 8px; font-size: 0.75rem;">
                ${line}
            </span>
            <button class="remove-favorite" onclick="toggleFavoriteLine('${line}')">×</button>
        </div>
    `).join('');
}

// Sound functionality
function toggleSounds() {
    soundEnabled = !soundEnabled;
    applySoundSettings();
    saveUserPreferences();
    showNotification(`Sounds ${soundEnabled ? 'enabled' : 'disabled'}`, 'info');
}

function applySoundSettings() {
    const toggle = document.getElementById('soundToggle');
    toggle.classList.toggle('active', soundEnabled);
}

function playSound(type) {
    if (!soundEnabled) return;
    
    // Create different sounds for different events
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
        'critical': 800,
        'warning': 600,
        'info': 400,
        'add': 500,
        'remove': 300,
        'refresh': 700
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Location functionality
function requestLocation() {
    if ('geolocation' in navigator) {
        showNotification('Getting your location...', 'info');
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                showNotification('Location found! Filtering nearby alerts.', 'success');
                document.getElementById('locationFilter').value = 'nearme';
                applyFilters();
                saveUserPreferences();
            },
            error => {
                showNotification('Could not get location. Please enable location services.', 'error');
            }
        );
    } else {
        showNotification('Location not supported by your browser.', 'error');
    }
}

// Rush hour mode
function toggleRushHourMode() {
    rushHourMode = !rushHourMode;
    const button = event.target;
    button.style.background = rushHourMode ? 'var(--accent-blue)' : '';
    button.style.color = rushHourMode ? 'white' : '';
    showNotification(`Rush Hour Mode ${rushHourMode ? 'ON' : 'OFF'}`, 'info');
    applyFilters();
    saveUserPreferences();
}

// Enhanced refresh function
function refreshAlerts() {
    saveUserPreferences();
    
    const refreshBtn = document.querySelector('.btn-primary');
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '⟳ Refreshing...';
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.7';
    
    playSound('refresh');
    loadAlerts();
    
    setTimeout(() => {
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        refreshBtn.style.opacity = '1';
    }, 1600);
}

// Load alerts with enhanced features
function loadAlerts() {
    showLoading();
    
    setTimeout(() => {
        currentAlerts = [...simulatedAlerts];
        applyFilters();
        updateStats();
        checkForCriticalAlerts();
        showNotification('Alerts refreshed successfully!', 'success');
    }, 1500);
}

function checkForCriticalAlerts() {
    const criticalAlerts = currentAlerts.filter(alert => alert.severity === 'critical');
    if (criticalAlerts.length > 0 && soundEnabled) {
        criticalAlerts.forEach(() => playSound('critical'));
    }
    
    // Browser notification for critical alerts
    if ('Notification' in window && Notification.permission === 'granted') {
        criticalAlerts.forEach(alert => {
            new Notification(`Critical Alert: ${alert.title}`, {
                body: alert.description.substring(0, 100) + '...',
                icon: '/favicon.ico'
            });
        });
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Enhanced filtering
function applyFilters() {
    const lineFilter = document.getElementById('lineFilter').value;
    const severityFilter = document.getElementById('severityFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const locationFilter = document.getElementById('locationFilter').value;

    filteredAlerts = currentAlerts.filter(alert => {
        // Line filter
        let lineMatch = lineFilter === 'all';
        if (lineFilter === 'favorites') {
            lineMatch = alert.lines.some(line => favoriteLines.has(line));
        } else if (lineFilter !== 'all') {
            lineMatch = alert.lines.some(line => {
                if (lineFilter === '123') return ['1', '2', '3'].includes(line);
                if (lineFilter === '456') return ['4', '5', '6'].includes(line);
                if (lineFilter === '7') return line === '7';
                if (lineFilter === 'ACE') return ['A', 'C', 'E'].includes(line);
                if (lineFilter === 'BDFM') return ['B', 'D', 'F', 'M'].includes(line);
                if (lineFilter === 'G') return line === 'G';
                if (lineFilter === 'JZ') return ['J', 'Z'].includes(line);
                if (lineFilter === 'L') return line === 'L';
                if (lineFilter === 'NQR') return ['N', 'Q', 'R', 'W'].includes(line);
                if (lineFilter === 'S') return line === 'S';
                return false;
            });
        }
        
        // Severity filter
        const severityMatch = severityFilter === 'all' || alert.severity === severityFilter;
        
        // Time filter
        let timeMatch = true;
        if (timeFilter === 'active') {
            timeMatch = !alert.estimatedResolution || alert.estimatedResolution > new Date();
        } else if (timeFilter === 'rush') {
            timeMatch = alert.isRushHour;
        } else if (timeFilter === 'planned') {
            timeMatch = alert.severity === 'info';
        }
        
        // Location filter
        let locationMatch = true;
        if (locationFilter === 'nearme' && userLocation) {
            // Simplified distance check - in real app would use proper geolocation
            locationMatch = parseFloat(alert.walkingDistance) < 1.0;
        } else if (locationFilter !== 'all' && locationFilter !== 'nearme') {
            locationMatch = alert.location === locationFilter;
        }
        
        // Rush hour mode override
        if (rushHourMode) {
            timeMatch = timeMatch && alert.isRushHour;
        }
        
        return lineMatch && severityMatch && timeMatch && locationMatch;
    });

    renderAlerts();
    updateStats();
}

// Enhanced alert rendering
function renderAlerts() {
    const container = document.getElementById('alertsContainer');
    
    if (filteredAlerts.length === 0) {
        container.innerHTML = `
            <div class="alert-card">
                <div class="alert-content" style="text-align: center; padding: 48px;">
                    <h3 style="color: var(--good-service); margin-bottom: 16px; font-size: 1.5rem;">✅ No Alerts Found</h3>
                    <p style="color: var(--text-muted);">No service alerts match your current filters. Try adjusting your criteria or check back later.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredAlerts.map(alert => `
        <div class="alert-card ${alert.severity}">
            <div class="alert-header">
                <div class="alert-meta">
                    <div class="alert-lines">
                        ${alert.lines.map(line => `
                            <span class="line-badge" style="background-color: ${lineColors[line] || '#666'}" onclick="toggleFavoriteLine('${line}')">
                                ${line}
                                ${favoriteLines.has(line) ? '<span class="favorite-star">⭐</span>' : ''}
                            </span>
                        `).join('')}
                    </div>
                    <span class="severity-badge ${alert.severity}">
                        <span class="severity-icon"></span>
                        ${alert.severity}
                    </span>
                    ${alert.isRushHour ? '<span class="rush-hour-badge">Rush Hour</span>' : ''}
                </div>
                <div class="alert-actions">
                    <button class="action-btn" onclick="shareSpecificAlert('${alert.id}')">📱 Share</button>
                    <button class="action-btn" onclick="getDirections('${alert.affectedStations[0]}')">🗺️ Directions</button>
                </div>
            </div>
            <div class="alert-content">
                <h3 class="alert-title">${alert.title}</h3>
                <p class="alert-description">${alert.description}</p>
                <div class="alert-details">
                    <div><strong>Affected Stations:</strong> ${alert.affectedStations.join(', ')}</div>
                    <div><strong>Service Status:</strong> ${getServiceReliabilityEmoji(alert.serviceReliability)}</div>
                    ${alert.estimatedResolution ? `<div><strong>Est. Resolution:</strong> ${formatTime(alert.estimatedResolution)}</div>` : ''}
                    <div class="location-info">📍 ${alert.walkingDistance} away</div>
                </div>
                <div class="alert-footer">
                    <span class="timestamp">
                        📅 Updated: ${formatTimestamp(alert.timestamp)}
                    </span>
                    <span style="color: var(--accent-blue); font-weight: 600;">
                        📍 ${alert.location.charAt(0).toUpperCase() + alert.location.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Enhanced statistics
function updateStats() {
    const stats = {
        critical: currentAlerts.filter(a => a.severity === 'critical').length,
        warning: currentAlerts.filter(a => a.severity === 'warning').length,
        info: currentAlerts.filter(a => a.severity === 'info').length,
        rushHour: currentAlerts.filter(a => a.isRushHour).length
    };

    const linesWithIssues = new Set();
    currentAlerts.forEach(alert => {
        if (alert.severity === 'critical') {
            alert.lines.forEach(line => linesWithIssues.add(line));
        }
    });
    
    const totalLines = Object.keys(lineColors).length;
    const goodServiceLines = totalLines - linesWithIssues.size;

    document.getElementById('criticalCount').textContent = stats.critical;
    document.getElementById('warningCount').textContent = stats.warning;
    document.getElementById('infoCount').textContent = stats.info;
    document.getElementById('goodServiceCount').textContent = goodServiceLines;
    document.getElementById('rushHourCount').textContent = stats.rushHour;
}

// Export functionality
function exportAlerts(format) {
    const data = filteredAlerts.map(alert => ({
        title: alert.title,
        description: alert.description,
        lines: alert.lines.join(', '),
        severity: alert.severity,
        timestamp: alert.timestamp.toISOString(),
        affectedStations: alert.affectedStations.join(', '),
        isRushHour: alert.isRushHour,
        location: alert.location,
        serviceReliability: alert.serviceReliability
    }));

    if (format === 'json') {
        downloadFile(JSON.stringify(data, null, 2), 'subway-alerts.json', 'application/json');
    } else if (format === 'csv') {
        const csv = convertToCSV(data);
        downloadFile(csv, 'subway-alerts.csv', 'text/csv');
    }
    
    showNotification(`Exported ${data.length} alerts as ${format.toUpperCase()}`, 'success');
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function printAlerts() {
    window.print();
}

// Share functionality
function shareAlert() {
    const summary = `NYC Subway Alert Summary (${new Date().toLocaleDateString()})\n\n` +
        `Critical Alerts: ${document.getElementById('criticalCount').textContent}\n` +
        `Warnings: ${document.getElementById('warningCount').textContent}\n` +
        `Info: ${document.getElementById('infoCount').textContent}\n\n` +
        `View full details at: ${window.location.href}`;

    if (navigator.share) {
        navigator.share({
            title: 'NYC Subway Alerts',
            text: summary,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(summary).then(() => {
            showNotification('Alert summary copied to clipboard!', 'success');
        });
    }
}

function shareSpecificAlert(alertId) {
    const alert = currentAlerts.find(a => a.id === alertId);
    if (!alert) return;

    const alertText = `🚇 ${alert.title}\n\n${alert.description}\n\nLines: ${alert.lines.join(', ')}\nSeverity: ${alert.severity.toUpperCase()}`;

    if (navigator.share) {
        navigator.share({
            title: alert.title,
            text: alertText
        });
    } else {
        navigator.clipboard.writeText(alertText).then(() => {
            showNotification('Alert copied to clipboard!', 'success');
        });
    }
}

function getDirections(station) {
    const query = encodeURIComponent(`${station} subway station NYC`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
}

// Utility functions
function getServiceReliabilityEmoji(percentage) {
    if (percentage >= 90) return '🟢 Excellent';
    if (percentage >= 75) return '🟡 Good';
    if (percentage >= 60) return '🟠 Fair';
    if (percentage >= 40) return '🔴 Poor';
    return '⛔ Very Poor';
}

function clearPreferences() {
    localStorage.removeItem('subwayAlertsPreferences');
    favoriteLines.clear();
    soundEnabled = false;
    rushHourMode = false;
    currentTheme = 'light';
    currentFontSize = 'normal';
    
    document.getElementById('lineFilter').value = 'all';
    document.getElementById('severityFilter').value = 'all';
    document.getElementById('timeFilter').value = 'all';
    document.getElementById('locationFilter').value = 'all';
    
    applyTheme('light');
    applySoundSettings();
    applyFontSize('normal');
    updateFavoriteLines();
    applyFilters();
    
    showNotification('All preferences cleared!', 'info');
}

function showLoading() {
    document.getElementById('alertsContainer').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading subway alerts...</p>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    return timestamp.toLocaleDateString();
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Auto-refresh with preferences
setInterval(() => {
    refreshAlerts();
}, 120000);