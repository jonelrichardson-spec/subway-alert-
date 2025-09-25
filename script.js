/*
 * NYC Subway Alerts Pro - JavaScript Module (Fixed Version)
 * Modern ES6+ JavaScript with robust error handling and deployment fixes
 */

// ========== CONSTANTS & CONFIGURATION ==========
const SUBWAY_LINE_COLORS = {
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

const REFRESH_INTERVAL = 120000; // 2 minutes
const STORAGE_KEY = 'subwayAlertsPreferences';

// ========== GLOBAL STATE ==========
const AppState = {
    currentAlerts: [],
    filteredAlerts: [],
    userPreferences: {
        soundEnabled: false,
        rushHourMode: false,
        currentTheme: 'light',
        currentFontSize: 'normal',
        currentLanguage: 'en',
        userLocation: null
    }
};

// ========== SIMULATED ALERT DATA ==========
const SIMULATED_ALERTS = [
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

// ========== TRANSLATION SYSTEM ==========
const TRANSLATIONS = {
    en: {
        title: "NYC Subway Alerts Pro",
        subtitle: "Real-time service alerts with smart features and accessibility",
        alertSounds: "Alert Sounds",
        filterByLine: "Filter by Line:",
        allLines: "All Lines",
        filterBySeverity: "Filter by Severity:",
        allSeverities: "All Severities",
        criticalOnly: "Critical Only",
        warnings: "Warnings",
        info: "Info",
        timeFilter: "Time Filter:",
        allTimes: "All Times",
        activeNow: "Active Now",
        rushHour: "Rush Hour Impact",
        plannedWork: "Planned Work",
        location: "Location:",
        allAreas: "All Areas",
        nearMe: "Near Me",
        manhattan: "Manhattan",
        brooklyn: "Brooklyn",
        queens: "Queens",
        bronx: "Bronx",
        refresh: "Refresh",
        rushMode: "Rush Mode",
        reset: "Reset",
        criticalAlerts: "Critical Alerts",
        serviceInfo: "Service Info",
        goodService: "Good Service",
        rushHourAlerts: "Rush Hour Alerts",
        exportShare: "Export & Share",
        exportJSON: "Export JSON",
        exportCSV: "Export CSV",
        printView: "Print View",
        shareSummary: "Share Summary",
        loadingAlerts: "Loading subway alerts...",
        noAlertsFound: "No Alerts Found",
        noAlertsMessage: "No service alerts match your current filters. Try adjusting your criteria or check back later.",
        share: "Share",
        directions: "Directions",
        affectedStations: "Affected Stations:",
        serviceStatus: "Service Status:",
        estimatedResolution: "Est. Resolution:",
        away: "away",
        updated: "Updated:",
        refreshing: "Refreshing...",
        alertsRefreshed: "Alerts refreshed successfully!",
        settingsRestored: "Settings restored from",
        minutesAgo: "minutes ago",
        soundsEnabled: "Sounds enabled",
        soundsDisabled: "Sounds disabled",
        gettingLocation: "Getting your location...",
        locationFound: "Location found! Filtering nearby alerts.",
        locationError: "Could not get location. Please enable location services.",
        locationNotSupported: "Location not supported by your browser.",
        rushHourModeOn: "Rush Hour Mode ON",
        rushHourModeOff: "Rush Hour Mode OFF",
        exported: "Exported",
        alertsAs: "alerts as",
        alertCopied: "Alert copied to clipboard!",
        summaryCopied: "Alert summary copied to clipboard!",
        preferencesCleared: "All preferences cleared!",
        justNow: "Just now",
        minAgo: "min ago",
        hoursAgo: "hours ago",
        critical: "critical",
        warning: "warning",
        serviceReliability: {
            excellent: "Excellent",
            good: "Good", 
            fair: "Fair",
            poor: "Poor",
            veryPoor: "Very Poor"
        },
        fontSizes: {
            normal: "Normal Text",
            large: "Large Text",
            small: "Small Text"
        },
        themeToggle: {
            dark: "Dark",
            light: "Light"
        }
    },
    es: {
        title: "Alertas del Metro de NYC Pro",
        subtitle: "Alertas de servicio en tiempo real con funciones inteligentes y accesibilidad",
        alertSounds: "Sonidos de Alerta",
        filterByLine: "Filtrar por Línea:",
        allLines: "Todas las Líneas",
        filterBySeverity: "Filtrar por Severidad:",
        allSeverities: "Todas las Severidades",
        criticalOnly: "Solo Críticas",
        warnings: "Advertencias",
        info: "Información",
        timeFilter: "Filtro de Tiempo:",
        allTimes: "Todos los Tiempos",
        activeNow: "Activo Ahora",
        rushHour: "Impacto de Hora Pico",
        plannedWork: "Trabajo Planificado",
        location: "Ubicación:",
        allAreas: "Todas las Áreas",
        nearMe: "Cerca de Mí",
        manhattan: "Manhattan",
        brooklyn: "Brooklyn",
        queens: "Queens",
        bronx: "Bronx",
        refresh: "Actualizar",
        rushMode: "Modo Hora Pico",
        reset: "Restablecer",
        criticalAlerts: "Alertas Críticas",
        serviceInfo: "Info del Servicio",
        goodService: "Buen Servicio",
        rushHourAlerts: "Alertas de Hora Pico",
        exportShare: "Exportar y Compartir",
        exportJSON: "Exportar JSON",
        exportCSV: "Exportar CSV",
        printView: "Vista de Impresión",
        shareSummary: "Compartir Resumen",
        loadingAlerts: "Cargando alertas del metro...",
        noAlertsFound: "No se Encontraron Alertas",
        noAlertsMessage: "Ninguna alerta de servicio coincide con sus filtros actuales. Intente ajustar sus criterios o vuelva más tarde.",
        share: "Compartir",
        directions: "Direcciones",
        affectedStations: "Estaciones Afectadas:",
        serviceStatus: "Estado del Servicio:",
        estimatedResolution: "Resolución Estimada:",
        away: "de distancia",
        updated: "Actualizado:",
        refreshing: "Actualizando...",
        alertsRefreshed: "¡Alertas actualizadas con éxito!",
        settingsRestored: "Configuración restaurada desde hace",
        minutesAgo: "minutos",
        soundsEnabled: "Sonidos habilitados",
        soundsDisabled: "Sonidos deshabilitados",
        gettingLocation: "Obteniendo su ubicación...",
        locationFound: "¡Ubicación encontrada! Filtrando alertas cercanas.",
        locationError: "No se pudo obtener la ubicación. Habilite los servicios de ubicación.",
        locationNotSupported: "Ubicación no compatible con su navegador.",
        rushHourModeOn: "Modo Hora Pico ACTIVADO",
        rushHourModeOff: "Modo Hora Pico DESACTIVADO",
        exported: "Exportadas",
        alertsAs: "alertas como",
        alertCopied: "¡Alerta copiada al portapapeles!",
        summaryCopied: "¡Resumen de alerta copiado al portapapeles!",
        preferencesCleared: "¡Todas las preferencias eliminadas!",
        justNow: "Ahora mismo",
        minAgo: "min atrás",
        hoursAgo: "horas atrás",
        critical: "crítico",
        warning: "advertencia",
        serviceReliability: {
            excellent: "Excelente",
            good: "Bueno",
            fair: "Regular", 
            poor: "Malo",
            veryPoor: "Muy Malo"
        },
        fontSizes: {
            normal: "Texto Normal",
            large: "Texto Grande",
            small: "Texto Pequeño"
        },
        themeToggle: {
            dark: "Oscuro",
            light: "Claro"
        }
    },
    fr: {
        title: "Alertes Métro NYC Pro",
        subtitle: "Alertes de service en temps réel avec fonctionnalités intelligentes et accessibilité",
        alertSounds: "Sons d'Alerte",
        filterByLine: "Filtrer par Ligne:",
        allLines: "Toutes les Lignes",
        filterBySeverity: "Filtrer par Gravité:",
        allSeverities: "Toutes les Gravités",
        criticalOnly: "Critique Seulement",
        warnings: "Avertissements",
        info: "Information",
        timeFilter: "Filtre Temporel:",
        allTimes: "Tous les Temps",
        activeNow: "Actif Maintenant",
        rushHour: "Impact Heure de Pointe",
        plannedWork: "Travaux Planifiés",
        location: "Emplacement:",
        allAreas: "Toutes les Zones",
        nearMe: "Près de Moi",
        manhattan: "Manhattan",
        brooklyn: "Brooklyn",
        queens: "Queens",
        bronx: "Bronx",
        refresh: "Actualiser",
        rushMode: "Mode Pointe",
        reset: "Réinitialiser",
        criticalAlerts: "Alertes Critiques",
        serviceInfo: "Info Service",
        goodService: "Bon Service",
        rushHourAlerts: "Alertes Heure Pointe",
        exportShare: "Exporter et Partager",
        exportJSON: "Exporter JSON",
        exportCSV: "Exporter CSV",
        printView: "Vue Impression",
        shareSummary: "Partager Résumé",
        loadingAlerts: "Chargement des alertes métro...",
        noAlertsFound: "Aucune Alerte Trouvée",
        noAlertsMessage: "Aucune alerte de service ne correspond à vos filtres actuels. Essayez d'ajuster vos critères ou revenez plus tard.",
        share: "Partager",
        directions: "Directions",
        affectedStations: "Stations Affectées:",
        serviceStatus: "État du Service:",
        estimatedResolution: "Résolution Estimée:",
        away: "de distance",
        updated: "Mis à jour:",
        refreshing: "Actualisation...",
        alertsRefreshed: "Alertes actualisées avec succès!",
        settingsRestored: "Paramètres restaurés depuis",
        minutesAgo: "minutes",
        soundsEnabled: "Sons activés",
        soundsDisabled: "Sons désactivés",
        gettingLocation: "Obtention de votre position...",
        locationFound: "Position trouvée! Filtrage des alertes à proximité.",
        locationError: "Impossible d'obtenir la position. Veuillez activer les services de localisation.",
        locationNotSupported: "Localisation non prise en charge par votre navigateur.",
        rushHourModeOn: "Mode Heure de Pointe ACTIVÉ",
        rushHourModeOff: "Mode Heure de Pointe DÉSACTIVÉ",
        exported: "Exporté",
        alertsAs: "alertes en tant que",
        alertCopied: "Alerte copiée dans le presse-papiers!",
        summaryCopied: "Résumé d'alerte copié dans le presse-papiers!",
        preferencesCleared: "Toutes les préférences effacées!",
        justNow: "À l'instant",
        minAgo: "min avant",
        hoursAgo: "heures avant",
        critical: "critique",
        warning: "avertissement",
        serviceReliability: {
            excellent: "Excellent",
            good: "Bon",
            fair: "Passable",
            poor: "Mauvais",
            veryPoor: "Très Mauvais"
        },
        fontSizes: {
            normal: "Texte Normal",
            large: "Grand Texte",
            small: "Petit Texte"
        },
        themeToggle: {
            dark: "Sombre",
            light: "Clair"
        }
    },
    ja: {
        title: "NYCサブウェイアラートプロ",
        subtitle: "スマート機能とアクセシビリティを備えたリアルタイムサービスアラート",
        alertSounds: "アラート音",
        filterByLine: "路線でフィルター:",
        allLines: "すべての路線",
        filterBySeverity: "重要度でフィルター:",
        allSeverities: "すべての重要度",
        criticalOnly: "重要のみ",
        warnings: "警告",
        info: "情報",
        timeFilter: "時間フィルター:",
        allTimes: "すべての時間",
        activeNow: "現在アクティブ",
        rushHour: "ラッシュアワーの影響",
        plannedWork: "計画作業",
        location: "場所:",
        allAreas: "すべてのエリア",
        nearMe: "近くの",
        manhattan: "マンハッタン",
        brooklyn: "ブルックリン",
        queens: "クイーンズ",
        bronx: "ブロンクス",
        refresh: "更新",
        rushMode: "ラッシュモード",
        reset: "リセット",
        criticalAlerts: "重要なアラート",
        serviceInfo: "サービス情報",
        goodService: "良好なサービス",
        rushHourAlerts: "ラッシュアワーアラート",
        exportShare: "エクスポートと共有",
        exportJSON: "JSON エクスポート",
        exportCSV: "CSV エクスポート",
        printView: "印刷ビュー",
        shareSummary: "概要を共有",
        loadingAlerts: "地下鉄アラートを読み込み中...",
        noAlertsFound: "アラートが見つかりません",
        noAlertsMessage: "現在のフィルターに一致するサービスアラートがありません。条件を調整するか、後でもう一度確認してください。",
        share: "共有",
        directions: "道順",
        affectedStations: "影響を受ける駅:",
        serviceStatus: "サービス状況:",
        estimatedResolution: "推定解決時間:",
        away: "離れた場所",
        updated: "更新:",
        refreshing: "更新中...",
        alertsRefreshed: "アラートが正常に更新されました！",
        settingsRestored: "設定が復元されました",
        minutesAgo: "分前",
        soundsEnabled: "サウンドが有効",
        soundsDisabled: "サウンドが無効",
        gettingLocation: "現在地を取得中...",
        locationFound: "位置が見つかりました！近くのアラートをフィルタリングしています。",
        locationError: "位置を取得できませんでした。位置情報サービスを有効にしてください。",
        locationNotSupported: "お使いのブラウザでは位置情報がサポートされていません。",
        rushHourModeOn: "ラッシュアワーモード オン",
        rushHourModeOff: "ラッシュアワーモード オフ",
        exported: "エクスポート済み",
        alertsAs: "アラートを",
        alertCopied: "アラートがクリップボードにコピーされました！",
        summaryCopied: "アラートの概要がクリップボードにコピーされました！",
        preferencesCleared: "すべての設定がクリアされました！",
        justNow: "たった今",
        minAgo: "分前",
        hoursAgo: "時間前",
        critical: "重要",
        warning: "警告",
        serviceReliability: {
            excellent: "優秀",
            good: "良好",
            fair: "普通",
            poor: "悪い",
            veryPoor: "とても悪い"
        },
        fontSizes: {
            normal: "通常のテキスト",
            large: "大きなテキスト",
            small: "小さなテキスト"
        },
        themeToggle: {
            dark: "ダーク",
            light: "ライト"
        }
    }
};

// ========== UTILITY FUNCTIONS ==========
const Utils = {
    /**
     * Translation helper function with safe fallbacks
     * @param {string} key - Translation key (supports dot notation)
     * @returns {string} Translated text
     */
    translate(key) {
        try {
            const keys = key.split('.');
            let value = TRANSLATIONS[AppState.userPreferences.currentLanguage];
            
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined) {
                    // Fallback to English
                    let fallback = TRANSLATIONS.en;
                    for (const fallbackKey of keys) {
                        fallback = fallback?.[fallbackKey];
                    }
                    return fallback || key;
                }
            }
            return value || key;
        } catch (error) {
            console.log('Translation error for key:', key, error);
            return key;
        }
    },

    /**
     * Format timestamp relative to current time
     * @param {Date} timestamp - The timestamp to format
     * @returns {string} Formatted time string
     */
    formatTimestamp(timestamp) {
        try {
            const now = new Date();
            const diff = now - timestamp;
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) return this.translate('justNow');
            if (minutes < 60) return `${minutes} ${this.translate('minAgo')}`;
            
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} ${this.translate('hoursAgo')}`;
            
            return timestamp.toLocaleDateString();
        } catch (error) {
            console.log('Timestamp formatting error:', error);
            return 'Unknown time';
        }
    },

    /**
     * Format time in 12-hour format
     * @param {Date} date - Date object to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        try {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } catch (error) {
            return 'Unknown time';
        }
    },

    /**
     * Get service reliability indicator
     * @param {number} percentage - Reliability percentage
     * @returns {string} Reliability indicator with emoji
     */
    getServiceReliabilityIndicator(percentage) {
        try {
            if (percentage >= 90) return this.translate('serviceReliability.excellent');
            if (percentage >= 75) return this.translate('serviceReliability.good');
            if (percentage >= 60) return this.translate('serviceReliability.fair');
            if (percentage >= 40) return this.translate('serviceReliability.poor');
            return this.translate('serviceReliability.veryPoor');
        } catch (error) {
            return 'Unknown';
        }
    },

    /**
     * Convert data to CSV format
     * @param {Array} data - Array of objects to convert
     * @returns {string} CSV formatted string
     */
    convertToCSV(data) {
        try {
            if (!data || data.length === 0) return '';
            
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
            ].join('\n');
            
            return csvContent;
        } catch (error) {
            console.log('CSV conversion error:', error);
            return '';
        }
    },

    /**
     * Download file to user's device
     * @param {string} content - File content
     * @param {string} filename - Name of file
     * @param {string} contentType - MIME type
     */
    downloadFile(content, filename, contentType) {
        try {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.log('File download error:', error);
        }
    }
};

// ========== NOTIFICATION SYSTEM ==========
const NotificationManager = {
    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, warning, error)
     */
    show(message, type = 'info') {
        try {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Animate out and remove
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.log('Notification error:', error);
        }
    }
};

// ========== SOUND SYSTEM ==========
const SoundManager = {
    /**
     * Play notification sound
     * @param {string} type - Sound type (critical, warning, info, refresh)
     */
    play(type) {
        if (!AppState.userPreferences.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const frequencies = {
                'critical': 800,
                'warning': 600,
                'info': 400,
                'refresh': 700
            };
            
            oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Sound playback failed (this is normal on many hosting platforms):', error);
        }
    },

    /**
     * Apply sound settings to UI
     */
    applySoundSettings() {
        try {
            const toggle = document.getElementById('soundToggle');
            if (toggle) {
                toggle.classList.toggle('active', AppState.userPreferences.soundEnabled);
            }
        } catch (error) {
            console.log('Sound settings application error:', error);
        }
    }
};

// ========== STORAGE MANAGER (FIXED VERSION) ==========
const StorageManager = {
    /**
     * Test if localStorage is available
     * @returns {boolean} Whether localStorage is available
     */
    isStorageAvailable() {
        try {
            if (typeof Storage === 'undefined') return false;
            
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Save user preferences with error handling
     */
    savePreferences() {
        if (!this.isStorageAvailable()) {
            console.log('Storage not available, preferences will not be saved');
            return;
        }

        try {
            const preferences = {
                lineFilter: this.getElementValue('lineFilter', 'all'),
                severityFilter: this.getElementValue('severityFilter', 'all'),
                timeFilter: this.getElementValue('timeFilter', 'all'),
                locationFilter: this.getElementValue('locationFilter', 'all'),
                soundEnabled: AppState.userPreferences.soundEnabled || false,
                theme: AppState.userPreferences.currentTheme || 'light',
                fontSize: AppState.userPreferences.currentFontSize || 'normal',
                rushHourMode: AppState.userPreferences.rushHourMode || false,
                language: AppState.userPreferences.currentLanguage || 'en',
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
            console.log('Preferences saved successfully');
        } catch (error) {
            console.log('Could not save preferences:', error);
        }
    },

    /**
     * Safely get element value
     * @param {string} id - Element ID
     * @param {string} defaultValue - Default value if element not found
     * @returns {string} Element value or default
     */
    getElementValue(id, defaultValue) {
        try {
            const element = document.getElementById(id);
            return element ? element.value : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    },

    /**
     * Safely set element value
     * @param {string} id - Element ID
     * @param {string} value - Value to set
     */
    setElementValue(id, value) {
        try {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        } catch (error) {
            console.log(`Could not set value for element ${id}:`, error);
        }
    },

    /**
     * Load user preferences with robust error handling
     */
    loadPreferences() {
        if (!this.isStorageAvailable()) {
            console.log('Storage not available, using default preferences');
            return;
        }

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                console.log('No saved preferences found, using defaults');
                return;
            }

            const preferences = JSON.parse(saved);
            console.log('Loading saved preferences:', preferences);
            
            // Safely update form elements
            this.setElementValue('lineFilter', preferences.lineFilter || 'all');
            this.setElementValue('severityFilter', preferences.severityFilter || 'all');
            this.setElementValue('timeFilter', preferences.timeFilter || 'all');
            this.setElementValue('locationFilter', preferences.locationFilter || 'all');
            this.setElementValue('languageSelector', preferences.language || 'en');
            
            // Update app state safely
            AppState.userPreferences.soundEnabled = Boolean(preferences.soundEnabled);
            AppState.userPreferences.currentTheme = preferences.theme || 'light';
            AppState.userPreferences.currentFontSize = preferences.fontSize || 'normal';
            AppState.userPreferences.rushHourMode = Boolean(preferences.rushHourMode);
            AppState.userPreferences.currentLanguage = preferences.language || 'en';
            
            // Apply preferences safely
            ThemeManager.apply(AppState.userPreferences.currentTheme);
            SoundManager.applySoundSettings();
            FontManager.apply(AppState.userPreferences.currentFontSize);
            
            // Show restoration notification if recent
            if (preferences.lastUpdated) {
                const lastUpdated = new Date(preferences.lastUpdated);
                const timeDiff = new Date() - lastUpdated;
                const minutesAgo = Math.floor(timeDiff / 60000);
                
                if (minutesAgo < 60) {
                    setTimeout(() => {
                        NotificationManager.show(
                            `${Utils.translate('settingsRestored')} ${minutesAgo} ${Utils.translate('minutesAgo')}`,
                            'info'
                        );
                    }, 1000);
                }
            }
            
            console.log('Preferences loaded successfully');
        } catch (error) {
            console.log('Could not load saved preferences (continuing with defaults):', error);
            // Continue with defaults - don't let this stop the app
        }
    },

    /**
     * Clear all stored preferences
     */
    clearPreferences() {
        try {
            if (this.isStorageAvailable()) {
                localStorage.removeItem(STORAGE_KEY);
                console.log('Preferences cleared');
            }
        } catch (error) {
            console.log('Could not clear preferences:', error);
        }
    }
};

// ========== THEME MANAGER ==========
const ThemeManager = {
    /**
     * Toggle between light and dark themes
     */
    toggle() {
        try {
            const newTheme = AppState.userPreferences.currentTheme === 'light' ? 'dark' : 'light';
            this.apply(newTheme);
            AppState.userPreferences.currentTheme = newTheme;
            StorageManager.savePreferences();
        } catch (error) {
            console.log('Theme toggle error:', error);
        }
    },

    /**
     * Apply specific theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    apply(theme) {
        try {
            document.documentElement.setAttribute('data-theme', theme);
            const toggle = document.querySelector('.theme-toggle');
            if (toggle) {
                toggle.textContent = theme === 'light' 
                    ? Utils.translate('themeToggle.dark') 
                    : Utils.translate('themeToggle.light');
            }
            AppState.userPreferences.currentTheme = theme;
        } catch (error) {
            console.log('Theme application error:', error);
        }
    }
};

// ========== FONT MANAGER ==========
const FontManager = {
    /**
     * Change font size
     * @param {string} size - Font size ('small', 'normal', 'large')
     */
    change(size) {
        try {
            this.apply(size);
            AppState.userPreferences.currentFontSize = size;
            StorageManager.savePreferences();
        } catch (error) {
            console.log('Font size change error:', error);
        }
    },

    /**
     * Apply font size to document
     * @param {string} size - Font size to apply
     */
    apply(size) {
        try {
            document.body.className = document.body.className.replace(/font-\w+/g, '');
            document.body.classList.add(`font-${size}`);
        } catch (error) {
            console.log('Font application error:', error);
        }
    }
};

// ========== LOCATION MANAGER ==========
const LocationManager = {
    /**
     * Request user's current location
     */
    request() {
        if (!('geolocation' in navigator)) {
            NotificationManager.show(Utils.translate('locationNotSupported'), 'error');
            return;
        }

        NotificationManager.show(Utils.translate('gettingLocation'), 'info');
        
        navigator.geolocation.getCurrentPosition(
            position => {
                try {
                    AppState.userPreferences.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    NotificationManager.show(Utils.translate('locationFound'), 'success');
                    StorageManager.setElementValue('locationFilter', 'nearme');
                    FilterManager.apply();
                    StorageManager.savePreferences();
                } catch (error) {
                    console.log('Location processing error:', error);
                }
            },
            error => {
                NotificationManager.show(Utils.translate('locationError'), 'error');
                console.log('Geolocation error:', error);
            }
        );
    }
};

// ========== ALERT MANAGER ==========
const AlertManager = {
    /**
     * Load alerts (simulated API call) with robust error handling
     */
    async load() {
        console.log('Starting to load alerts...');
        UIManager.showLoading();
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    console.log('Loading simulated alerts data...');
                    
                    // Verify SIMULATED_ALERTS is available
                    if (!SIMULATED_ALERTS || !Array.isArray(SIMULATED_ALERTS)) {
                        throw new Error('SIMULATED_ALERTS data not available');
                    }
                    
                    AppState.currentAlerts = [...SIMULATED_ALERTS];
                    console.log('Alerts loaded successfully:', AppState.currentAlerts.length, 'alerts');
                    
                    FilterManager.apply();
                    StatisticsManager.update();
                    this.checkForCriticalAlerts();
                    
                    NotificationManager.show(Utils.translate('alertsRefreshed'), 'success');
                    console.log('Alert loading process complete!');
                    resolve();
                } catch (error) {
                    console.error('Error during alert loading:', error);
                    // Don't reject - show error but continue with empty data
                    AppState.currentAlerts = [];
                    FilterManager.apply();
                    StatisticsManager.update();
                    resolve(); // Resolve anyway to continue app initialization
                }
            }, 500); // Reduced loading time for better UX
        });
    },

    /**
     * Check for critical alerts and notify user
     */
    checkForCriticalAlerts() {
        try {
            const criticalAlerts = AppState.currentAlerts.filter(alert => alert.severity === 'critical');
            
            if (criticalAlerts.length > 0) {
                criticalAlerts.forEach(() => SoundManager.play('critical'));
                
                // Browser notifications
                if ('Notification' in window && Notification.permission === 'granted') {
                    criticalAlerts.forEach(alert => {
                        try {
                            new Notification(`${Utils.translate('critical')}: ${alert.title}`, {
                                body: alert.description.substring(0, 100) + '...',
                                icon: '/favicon.ico'
                            });
                        } catch (error) {
                            console.log('Browser notification error:', error);
                        }
                    });
                }
            }
        } catch (error) {
            console.log('Critical alerts check error:', error);
        }
    },

    /**
     * Request notification permission
     */
    requestNotificationPermission() {
        try {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (error) {
            console.log('Notification permission error:', error);
        }
    }
};

// ========== FILTER MANAGER ==========
const FilterManager = {
    /**
     * Apply all active filters to alerts
     */
    apply() {
        try {
            const lineFilter = StorageManager.getElementValue('lineFilter', 'all');
            const severityFilter = StorageManager.getElementValue('severityFilter', 'all');
            const timeFilter = StorageManager.getElementValue('timeFilter', 'all');
            const locationFilter = StorageManager.getElementValue('locationFilter', 'all');

            AppState.filteredAlerts = AppState.currentAlerts.filter(alert => {
                return this.matchesLineFilter(alert, lineFilter) &&
                       this.matchesSeverityFilter(alert, severityFilter) &&
                       this.matchesTimeFilter(alert, timeFilter) &&
                       this.matchesLocationFilter(alert, locationFilter) &&
                       this.matchesRushHourMode(alert);
            });

            UIManager.renderAlerts();
            StatisticsManager.update();
            console.log('Filters applied, showing', AppState.filteredAlerts.length, 'alerts');
        } catch (error) {
            console.log('Filter application error:', error);
            // Show all alerts if filtering fails
            AppState.filteredAlerts = [...AppState.currentAlerts];
            UIManager.renderAlerts();
        }
    },

    /**
     * Check if alert matches line filter
     */
    matchesLineFilter(alert, filter) {
        if (filter === 'all' || !alert.lines) return true;
        
        return alert.lines.some(line => {
            switch (filter) {
                case '123': return ['1', '2', '3'].includes(line);
                case '456': return ['4', '5', '6'].includes(line);
                case '7': return line === '7';
                case 'ACE': return ['A', 'C', 'E'].includes(line);
                case 'BDFM': return ['B', 'D', 'F', 'M'].includes(line);
                case 'G': return line === 'G';
                case 'JZ': return ['J', 'Z'].includes(line);
                case 'L': return line === 'L';
                case 'NQR': return ['N', 'Q', 'R', 'W'].includes(line);
                case 'S': return line === 'S';
                default: return false;
            }
        });
    },

    /**
     * Check if alert matches severity filter
     */
    matchesSeverityFilter(alert, filter) {
        return filter === 'all' || alert.severity === filter;
    },

    /**
     * Check if alert matches time filter
     */
    matchesTimeFilter(alert, filter) {
        try {
            switch (filter) {
                case 'all':
                    return true;
                case 'active':
                    return !alert.estimatedResolution || alert.estimatedResolution > new Date();
                case 'rush':
                    return alert.isRushHour;
                case 'planned':
                    return alert.severity === 'info';
                default:
                    return true;
            }
        } catch (error) {
            console.log('Time filter error:', error);
            return true;
        }
    },

    /**
     * Check if alert matches location filter
     */
    matchesLocationFilter(alert, filter) {
        try {
            if (filter === 'all') return true;
            if (filter === 'nearme' && AppState.userPreferences.userLocation) {
                const distance = parseFloat(alert.walkingDistance);
                return !isNaN(distance) && distance < 1.0;
            }
            if (filter !== 'all' && filter !== 'nearme') {
                return alert.location === filter;
            }
            return true;
        } catch (error) {
            console.log('Location filter error:', error);
            return true;
        }
    },

    /**
     * Check if alert matches rush hour mode
     */
    matchesRushHourMode(alert) {
        return !AppState.userPreferences.rushHourMode || alert.isRushHour;
    }
};

// ========== UI MANAGER ==========
const UIManager = {
    /**
     * Update all UI text based on current language
     */
    updateLanguage() {
        try {
            console.log('Updating UI language to:', AppState.userPreferences.currentLanguage);
            
            // Header
            const headerTitle = document.querySelector('.header h1');
            const headerSubtitle = document.querySelector('.header p');
            if (headerTitle) headerTitle.innerHTML = `🚇 ${Utils.translate('title')}`;
            if (headerSubtitle) headerSubtitle.textContent = Utils.translate('subtitle');
            
            // Theme toggle button
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.textContent = AppState.userPreferences.currentTheme === 'light' 
                    ? Utils.translate('themeToggle.dark') 
                    : Utils.translate('themeToggle.light');
            }
            
            // Font size selector options
            const fontOptions = document.querySelectorAll('.font-size-btn option');
            if (fontOptions.length >= 3) {
                fontOptions[0].textContent = Utils.translate('fontSizes.normal');
                fontOptions[1].textContent = Utils.translate('fontSizes.large');
                fontOptions[2].textContent = Utils.translate('fontSizes.small');
            }
            
            // Sound section
            const soundToggle = document.querySelector('.sound-toggle span');
            if (soundToggle) soundToggle.innerHTML = `🔊 ${Utils.translate('alertSounds')}`;
            
            // Control labels
            this.updateControlLabel('lineFilter', 'filterByLine');
            this.updateControlLabel('severityFilter', 'filterBySeverity');
            this.updateControlLabel('timeFilter', 'timeFilter');
            this.updateControlLabel('locationFilter', 'location');
            
            // Update filter options
            this.updateFilterOptions();
            
            // Quick action buttons
            const quickActionButtons = document.querySelectorAll('.quick-actions button');
            if (quickActionButtons.length >= 4) {
                quickActionButtons[0].innerHTML = `🔄 ${Utils.translate('refresh')}`;
                quickActionButtons[1].innerHTML = `⏰ ${Utils.translate('rushMode')}`;
                quickActionButtons[2].innerHTML = `🗑️ ${Utils.translate('reset')}`;
                quickActionButtons[3].innerHTML = `🔍 ${Utils.translate('nearMe')}`;
            }
            
            // Stats labels
            const statLabels = document.querySelectorAll('.stat-label');
            if (statLabels.length >= 5) {
                statLabels[0].textContent = Utils.translate('criticalAlerts');
                statLabels[1].textContent = Utils.translate('warnings');
                statLabels[2].textContent = Utils.translate('serviceInfo');
                statLabels[3].textContent = Utils.translate('goodService');
                statLabels[4].textContent = Utils.translate('rushHourAlerts');
            }
            
            // Export section
            const exportTitle = document.querySelector('.export-section h3');
            if (exportTitle) exportTitle.innerHTML = `📤 ${Utils.translate('exportShare')}`;
            
            const exportButtons = document.querySelectorAll('.export-buttons button');
            if (exportButtons.length >= 4) {
                exportButtons[0].innerHTML = `📄 ${Utils.translate('exportJSON')}`;
                exportButtons[1].innerHTML = `📊 ${Utils.translate('exportCSV')}`;
                exportButtons[2].innerHTML = `🖨️ ${Utils.translate('printView')}`;
                exportButtons[3].innerHTML = `📱 ${Utils.translate('shareSummary')}`;
            }
            
            // Re-render alerts if they exist
            if (AppState.filteredAlerts && AppState.filteredAlerts.length > 0) {
                this.renderAlerts();
            }
            
            console.log('UI language update complete');
        } catch (error) {
            console.log('UI language update error:', error);
        }
    },

    /**
     * Update control label safely
     * @param {string} forId - ID of the element the label is for
     * @param {string} translationKey - Translation key
     */
    updateControlLabel(forId, translationKey) {
        try {
            const label = document.querySelector(`label[for="${forId}"]`);
            if (label) {
                label.textContent = Utils.translate(translationKey);
            }
        } catch (error) {
            console.log(`Error updating label for ${forId}:`, error);
        }
    },

    /**
     * Update filter dropdown options
     */
    updateFilterOptions() {
        try {
            // Line filter options
            this.updateSelectOptions('lineFilter', [
                { value: 'all', key: 'allLines' }
            ]);
            
            // Severity filter options  
            this.updateSelectOptions('severityFilter', [
                { value: 'all', key: 'allSeverities' },
                { value: 'critical', key: 'criticalOnly' },
                { value: 'warning', key: 'warnings' },
                { value: 'info', key: 'info' }
            ]);
            
            // Time filter options
            this.updateSelectOptions('timeFilter', [
                { value: 'all', key: 'allTimes' },
                { value: 'active', key: 'activeNow' },
                { value: 'rush', key: 'rushHour' },
                { value: 'planned', key: 'plannedWork' }
            ]);
            
            // Location filter options
            this.updateSelectOptions('locationFilter', [
                { value: 'all', key: 'allAreas' },
                { value: 'nearme', key: 'nearMe' },
                { value: 'manhattan', key: 'manhattan' },
                { value: 'brooklyn', key: 'brooklyn' },
                { value: 'queens', key: 'queens' },
                { value: 'bronx', key: 'bronx' }
            ]);
        } catch (error) {
            console.log('Filter options update error:', error);
        }
    },

    /**
     * Update select element options
     * @param {string} selectId - Select element ID
     * @param {Array} options - Array of {value, key} objects
     */
    updateSelectOptions(selectId, options) {
        try {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            options.forEach((option, index) => {
                const optionElement = select.options[index];
                if (optionElement && optionElement.value === option.value) {
                    optionElement.textContent = Utils.translate(option.key);
                }
            });
        } catch (error) {
            console.log(`Error updating options for ${selectId}:`, error);
        }
    },

    /**
     * Show loading spinner
     */
    showLoading() {
        try {
            const container = document.getElementById('alertsContainer');
            if (container) {
                container.innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>${Utils.translate('loadingAlerts')}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.log('Show loading error:', error);
        }
    },

    /**
     * Render alerts to the DOM
     */
    renderAlerts() {
        try {
            const container = document.getElementById('alertsContainer');
            if (!container) {
                console.log('Alerts container not found');
                return;
            }
            
            if (!AppState.filteredAlerts || AppState.filteredAlerts.length === 0) {
                container.innerHTML = `
                    <div class="alert-card">
                        <div class="alert-content" style="text-align: center; padding: 48px;">
                            <h3 style="color: var(--good-service); margin-bottom: 16px; font-size: 1.5rem;">
                                ✅ ${Utils.translate('noAlertsFound')}
                            </h3>
                            <p style="color: var(--text-muted);">
                                ${Utils.translate('noAlertsMessage')}
                            </p>
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = AppState.filteredAlerts.map(alert => {
                try {
                    return `
                        <div class="alert-card ${alert.severity || 'info'}">
                            <div class="alert-header">
                                <div class="alert-meta">
                                    <div class="alert-lines">
                                        ${(alert.lines || []).map(line => `
                                            <span class="line-badge" style="background-color: ${SUBWAY_LINE_COLORS[line] || '#666'}">
                                                ${line}
                                            </span>
                                        `).join('')}
                                    </div>
                                    <span class="severity-badge ${alert.severity || 'info'}">
                                        ${Utils.translate(alert.severity || 'info')}
                                    </span>
                                    ${alert.isRushHour ? `<span class="rush-hour-badge">${Utils.translate('rushHour')}</span>` : ''}
                                </div>
                                <div class="alert-actions">
                                    <button class="action-btn" onclick="ShareManager.shareAlert('${alert.id}')">${Utils.translate('share')}</button>
                                    <button class="action-btn" onclick="DirectionsManager.get('${(alert.affectedStations || [])[0] || ''}')">${Utils.translate('directions')}</button>
                                </div>
                            </div>
                            <div class="alert-content">
                                <h3 class="alert-title">${alert.title || 'Untitled Alert'}</h3>
                                <p class="alert-description">${alert.description || 'No description available'}</p>
                                <div class="alert-details">
                                    <div><strong>${Utils.translate('affectedStations')}</strong> ${(alert.affectedStations || []).join(', ') || 'Unknown'}</div>
                                    <div><strong>${Utils.translate('serviceStatus')}</strong> ${Utils.getServiceReliabilityIndicator(alert.serviceReliability || 50)}</div>
                                    ${alert.estimatedResolution ? `<div><strong>${Utils.translate('estimatedResolution')}</strong> ${Utils.formatTime(alert.estimatedResolution)}</div>` : ''}
                                    <div class="location-info">🔍 ${alert.walkingDistance || 'Unknown distance'} ${Utils.translate('away')}</div>
                                </div>
                                <div class="alert-footer">
                                    <span class="timestamp">
                                        📅 ${Utils.translate('updated')} ${Utils.formatTimestamp(alert.timestamp || new Date())}
                                    </span>
                                    <span style="color: var(--accent-blue); font-weight: 600;">
                                        🔍 ${Utils.translate(alert.location || 'unknown')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (alertError) {
                    console.log('Error rendering individual alert:', alertError);
                    return `<div class="alert-card warning">Error rendering alert</div>`;
                }
            }).join('');
            
            console.log('Successfully rendered', AppState.filteredAlerts.length, 'alerts');
        } catch (error) {
            console.log('Render alerts error:', error);
            // Show fallback message
            const container = document.getElementById('alertsContainer');
            if (container) {
                container.innerHTML = `
                    <div class="alert-card warning">
                        <div class="alert-content" style="text-align: center; padding: 32px;">
                            <h3 style="color: #ea580c; margin-bottom: 16px;">⚠️ Rendering Error</h3>
                            <p>Unable to display alerts properly. Please refresh the page.</p>
                        </div>
                    </div>
                `;
            }
        }
    }
};

// ========== STATISTICS MANAGER ==========
const StatisticsManager = {
    /**
     * Update statistics display
     */
    update() {
        try {
            if (!AppState.currentAlerts) {
                console.log('No current alerts to process for statistics');
                return;
            }

            const stats = {
                critical: AppState.currentAlerts.filter(a => a.severity === 'critical').length,
                warning: AppState.currentAlerts.filter(a => a.severity === 'warning').length,
                info: AppState.currentAlerts.filter(a => a.severity === 'info').length,
                rushHour: AppState.currentAlerts.filter(a => a.isRushHour).length
            };

            // Calculate good service lines
            const linesWithIssues = new Set();
            AppState.currentAlerts.forEach(alert => {
                if (alert.severity === 'critical' && alert.lines) {
                    alert.lines.forEach(line => linesWithIssues.add(line));
                }
            });
            
            const totalLines = Object.keys(SUBWAY_LINE_COLORS).length;
            const goodServiceLines = totalLines - linesWithIssues.size;

            // Update DOM elements safely
            this.updateStatElement('criticalCount', stats.critical);
            this.updateStatElement('warningCount', stats.warning);
            this.updateStatElement('infoCount', stats.info);
            this.updateStatElement('goodServiceCount', goodServiceLines);
            this.updateStatElement('rushHourCount', stats.rushHour);
            
            console.log('Statistics updated:', stats);
        } catch (error) {
            console.log('Statistics update error:', error);
        }
    },

    /**
     * Safely update a statistic element
     * @param {string} id - Element ID
     * @param {number} value - Value to display
     */
    updateStatElement(id, value) {
        try {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || 0;
            }
        } catch (error) {
            console.log(`Error updating stat element ${id}:`, error);
        }
    }
};

// ========== EXPORT MANAGER ==========
const ExportManager = {
    /**
     * Export alerts in specified format
     * @param {string} format - Export format ('json' or 'csv')
     */
    export(format) {
        try {
            if (!AppState.filteredAlerts || AppState.filteredAlerts.length === 0) {
                NotificationManager.show('No alerts to export', 'warning');
                return;
            }

            const data = AppState.filteredAlerts.map(alert => ({
                title: alert.title || '',
                description: alert.description || '',
                lines: (alert.lines || []).join(', '),
                severity: alert.severity || '',
                timestamp: alert.timestamp ? alert.timestamp.toISOString() : '',
                affectedStations: (alert.affectedStations || []).join(', '),
                isRushHour: Boolean(alert.isRushHour),
                location: alert.location || '',
                serviceReliability: alert.serviceReliability || 0
            }));

            const filename = `subway-alerts-${new Date().toISOString().split('T')[0]}.${format}`;
            
            if (format === 'json') {
                Utils.downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
            } else if (format === 'csv') {
                const csv = Utils.convertToCSV(data);
                Utils.downloadFile(csv, filename, 'text/csv');
            }
            
            NotificationManager.show(
                `${Utils.translate('exported')} ${data.length} ${Utils.translate('alertsAs')} ${format.toUpperCase()}`,
                'success'
            );
        } catch (error) {
            console.log('Export error:', error);
            NotificationManager.show('Export failed', 'error');
        }
    },

    /**
     * Print alerts
     */
    print() {
        try {
            window.print();
        } catch (error) {
            console.log('Print error:', error);
            NotificationManager.show('Print failed', 'error');
        }
    }
};

// ========== SHARE MANAGER ==========
const ShareManager = {
    /**
     * Share alert summary
     */
    shareSummary() {
        try {
            const criticalCount = document.getElementById('criticalCount')?.textContent || '0';
            const warningCount = document.getElementById('warningCount')?.textContent || '0';
            const infoCount = document.getElementById('infoCount')?.textContent || '0';
            
            const summary = `${Utils.translate('title')} (${new Date().toLocaleDateString()})\n\n` +
                `${Utils.translate('criticalAlerts')}: ${criticalCount}\n` +
                `${Utils.translate('warnings')}: ${warningCount}\n` +
                `${Utils.translate('serviceInfo')}: ${infoCount}\n\n` +
                `View full details at: ${window.location.href}`;

            if (navigator.share) {
                navigator.share({
                    title: Utils.translate('title'),
                    text: summary,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(summary).then(() => {
                    NotificationManager.show(Utils.translate('summaryCopied'), 'success');
                }).catch(() => {
                    NotificationManager.show('Could not copy to clipboard', 'error');
                });
            }
        } catch (error) {
            console.log('Share summary error:', error);
            NotificationManager.show('Share failed', 'error');
        }
    },

    /**
     * Share specific alert
     * @param {string} alertId - ID of alert to share
     */
    shareAlert(alertId) {
        try {
            const alert = AppState.currentAlerts.find(a => a.id === alertId);
            if (!alert) {
                NotificationManager.show('Alert not found', 'error');
                return;
            }

            const alertText = `🚇 ${alert.title}\n\n${alert.description}\n\n` +
                `${Utils.translate('filterByLine').replace(':', '')} ${(alert.lines || []).join(', ')}\n` +
                `${Utils.translate('filterBySeverity').replace(':', '')} ${Utils.translate(alert.severity || 'info').toUpperCase()}`;

            if (navigator.share) {
                navigator.share({
                    title: alert.title,
                    text: alertText
                });
            } else {
                navigator.clipboard.writeText(alertText).then(() => {
                    NotificationManager.show(Utils.translate('alertCopied'), 'success');
                }).catch(() => {
                    NotificationManager.show('Could not copy to clipboard', 'error');
                });
            }
        } catch (error) {
            console.log('Share alert error:', error);
            NotificationManager.show('Share failed', 'error');
        }
    }
};

// ========== DIRECTIONS MANAGER ==========
const DirectionsManager = {
    /**
     * Get directions to station
     * @param {string} station - Station name
     */
    get(station) {
        try {
            if (!station) {
                NotificationManager.show('No station specified', 'error');
                return;
            }
            const query = encodeURIComponent(`${station} subway station NYC`);
            window.open(`https://www.google.com/maps/search/${query}`, '_blank');
        } catch (error) {
            console.log('Directions error:', error);
            NotificationManager.show('Could not open directions', 'error');
        }
    }
};

// ========== MAIN APPLICATION CONTROLLER ==========
const App = {
    /**
     * Initialize the application with comprehensive error handling
     */
    async init() {
        console.log('🚇 NYC Subway Alerts Pro - Starting initialization...');
        
        try {
            console.log('Step 1: Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('Step 2: Loading user preferences...');
            StorageManager.loadPreferences();
            
            console.log('Step 3: Loading alert data...');
            await AlertManager.load();
            
            console.log('Step 4: Requesting notification permission...');
            AlertManager.requestNotificationPermission();
            
            console.log('Step 5: Updating UI language...');
            UIManager.updateLanguage();
            
            console.log('Step 6: Starting auto refresh...');
            this.startAutoRefresh();
            
            console.log('✅ App initialization complete!');
            NotificationManager.show('App loaded successfully', 'success');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            
            // Emergency fallback - show basic functionality
            console.log('🔄 Running emergency fallback...');
            try {
                AppState.currentAlerts = [...SIMULATED_ALERTS];
                FilterManager.apply();
                StatisticsManager.update();
                UIManager.updateLanguage();
                
                const container = document.getElementById('alertsContainer');
                if (container && AppState.currentAlerts.length === 0) {
                    container.innerHTML = `
                        <div class="alert-card warning">
                            <div class="alert-content" style="text-align: center; padding: 32px;">
                                <h3 style="color: #ea580c; margin-bottom: 16px;">⚠️ Limited Functionality</h3>
                                <p style="margin-bottom: 16px;">Some features may not work properly, but basic alert viewing is available.</p>
                                <button onclick="location.reload()" class="btn-secondary">Refresh Page</button>
                            </div>
                        </div>
                    `;
                }
                
                console.log('🆘 Emergency fallback completed');
                NotificationManager.show('App loaded with limited functionality', 'warning');
            } catch (fallbackError) {
                console.error('💥 Emergency fallback also failed:', fallbackError);
                NotificationManager.show('App failed to load properly', 'error');
            }
        }
    },

    /**
     * Setup all event listeners with error handling
     */
    setupEventListeners() {
        try {
            // Filter event listeners with error handling
            const setupFilterListener = (id, callback) => {
                try {
                    const element = document.getElementById(id);
                    if (element) {
                        element.addEventListener('change', () => {
                            try {
                                StorageManager.savePreferences();
                                callback();
                            } catch (error) {
                                console.log(`Error in ${id} change handler:`, error);
                            }
                        });
                    } else {
                        console.log(`Element ${id} not found for event listener`);
                    }
                } catch (error) {
                    console.log(`Failed to setup listener for ${id}:`, error);
                }
            };

            setupFilterListener('lineFilter', () => FilterManager.apply());
            setupFilterListener('severityFilter', () => FilterManager.apply());
            setupFilterListener('timeFilter', () => FilterManager.apply());
            setupFilterListener('locationFilter', () => FilterManager.apply());
            
            console.log('Event listeners setup completed');
        } catch (error) {
            console.log('Event listeners setup error:', error);
        }
    },

    /**
     * Start automatic refresh
     */
    startAutoRefresh() {
        try {
            setInterval(() => {
                this.refreshAlerts();
            }, REFRESH_INTERVAL);
            console.log('Auto refresh started');
        } catch (error) {
            console.log('Auto refresh setup error:', error);
        }
    },

    /**
     * Refresh alerts with UI feedback
     */
    async refreshAlerts() {
        try {
            StorageManager.savePreferences();
            
            const refreshBtn = document.querySelector('.btn-primary');
            const originalText = refreshBtn?.innerHTML || 'Refresh';
            
            if (refreshBtn) {
                refreshBtn.innerHTML = `⏳ ${Utils.translate('refreshing')}`;
                refreshBtn.disabled = true;
                refreshBtn.style.opacity = '0.7';
            }
            
            SoundManager.play('refresh');
            await AlertManager.load();
            
            setTimeout(() => {
                if (refreshBtn) {
                    refreshBtn.innerHTML = Utils.translate('refresh');
                    refreshBtn.disabled = false;
                    refreshBtn.style.opacity = '1';
                }
            }, 1000);
        } catch (error) {
            console.log('Refresh alerts error:', error);
            NotificationManager.show('Refresh failed', 'error');
        }
    },

    /**
     * Toggle rush hour mode
     */
    toggleRushHourMode() {
        try {
            AppState.userPreferences.rushHourMode = !AppState.userPreferences.rushHourMode;
            
            const button = document.querySelector('.quick-actions button:nth-child(2)');
            if (button) {
                button.style.background = AppState.userPreferences.rushHourMode ? 'var(--accent-blue)' : '';
                button.style.color = AppState.userPreferences.rushHourMode ? 'white' : '';
            }
            
            NotificationManager.show(
                AppState.userPreferences.rushHourMode 
                    ? Utils.translate('rushHourModeOn') 
                    : Utils.translate('rushHourModeOff'),
                'info'
            );
            
            FilterManager.apply();
            StorageManager.savePreferences();
        } catch (error) {
            console.log('Rush hour mode toggle error:', error);
        }
    },

    /**
     * Clear all preferences
     */
    clearPreferences() {
        try {
            StorageManager.clearPreferences();
            
            // Reset state
            AppState.userPreferences.soundEnabled = false;
            AppState.userPreferences.rushHourMode = false;
            AppState.userPreferences.currentTheme = 'light';
            AppState.userPreferences.currentFontSize = 'normal';
            AppState.userPreferences.currentLanguage = 'en';
            
            // Reset form elements safely
            StorageManager.setElementValue('lineFilter', 'all');
            StorageManager.setElementValue('severityFilter', 'all');
            StorageManager.setElementValue('timeFilter', 'all');
            StorageManager.setElementValue('locationFilter', 'all');
            StorageManager.setElementValue('languageSelector', 'en');
            
            // Apply defaults
            ThemeManager.apply('light');
            SoundManager.applySoundSettings();
            FontManager.apply('normal');
            UIManager.updateLanguage();
            FilterManager.apply();
            
            NotificationManager.show(Utils.translate('preferencesCleared'), 'info');
        } catch (error) {
            console.log('Clear preferences error:', error);
            NotificationManager.show('Failed to clear preferences', 'error');
        }
    }
};

// ========== GLOBAL FUNCTION BINDINGS ==========
// These functions are called from the HTML onclick attributes

/**
 * Change application language
 * @param {string} language - Language code
 */
function changeLanguage(language) {
    try {
        AppState.userPreferences.currentLanguage = language;
        UIManager.updateLanguage();
        StorageManager.savePreferences();
        NotificationManager.show(Utils.translate('alertsRefreshed'), 'success');
    } catch (error) {
        console.log('Change language error:', error);
    }
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    try {
        ThemeManager.toggle();
    } catch (error) {
        console.log('Toggle theme error:', error);
    }
}

/**
 * Change font size
 * @param {string} size - Font size
 */
function changeFontSize(size) {
    try {
        FontManager.change(size);
    } catch (error) {
        console.log('Change font size error:', error);
    }
}

/**
 * Toggle sound on/off
 */
function toggleSounds() {
    try {
        AppState.userPreferences.soundEnabled = !AppState.userPreferences.soundEnabled;
        SoundManager.applySoundSettings();
        StorageManager.savePreferences();
        NotificationManager.show(
            AppState.userPreferences.soundEnabled 
                ? Utils.translate('soundsEnabled') 
                : Utils.translate('soundsDisabled'),
            'info'
        );
    } catch (error) {
        console.log('Toggle sounds error:', error);
    }
}

/**
 * Refresh alerts
 */
function refreshAlerts() {
    try {
        App.refreshAlerts();
    } catch (error) {
        console.log('Refresh alerts function error:', error);
    }
}

/**
 * Toggle rush hour mode
 */
function toggleRushHourMode() {
    try {
        App.toggleRushHourMode();
    } catch (error) {
        console.log('Toggle rush hour mode error:', error);
    }
}

/**
 * Clear all preferences
 */
function clearPreferences() {
    try {
        App.clearPreferences();
    } catch (error) {
        console.log('Clear preferences function error:', error);
    }
}

/**
 * Request user location
 */
function requestLocation() {
    try {
        LocationManager.request();
    } catch (error) {
        console.log('Request location error:', error);
    }
}

/**
 * Export alerts
 * @param {string} format - Export format
 */
function exportAlerts(format) {
    try {
        ExportManager.export(format);
    } catch (error) {
        console.log('Export alerts error:', error);
    }
}

/**
 * Print alerts
 */
function printAlerts() {
    try {
        ExportManager.print();
    } catch (error) {
        console.log('Print alerts error:', error);
    }
}

/**
 * Share alert summary
 */
function shareAlert() {
    try {
        ShareManager.shareSummary();
    } catch (error) {
        console.log('Share alert error:', error);
    }
}

// ========== APPLICATION STARTUP ==========
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, initializing NYC Subway Alerts Pro...');
    
    // Initialize the app
    App.init().catch(error => {
        console.error('🚨 Final app initialization error:', error);
    });
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
    NotificationManager.show('An error occurred. Please refresh the page.', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    NotificationManager.show('An error occurred. Please refresh the page.', 'error');
});

console.log('🚇 NYC Subway Alerts Pro JavaScript loaded successfully');