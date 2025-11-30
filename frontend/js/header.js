// header.js - Manages header functionality and navigation
class HeaderManager {
    constructor() {
        this.initializeHeader();
        this.setupEventListeners();
    }

    async initializeHeader() {
        // Load header if not already present
        if (!document.getElementById('site-header')) {
            try {
                const response = await fetch('partials/header.html');
                if (!response.ok) throw new Error('Failed to load header');
                const html = await response.text();
                
                const header = document.createElement('div');
                header.id = 'site-header';
                header.innerHTML = html;
                document.body.prepend(header);
                
                this.setupTheme();
                this.setupLanguageSelector();
                console.log('Header initialized successfully');
            } catch (error) {
                console.error('Error initializing header:', error);
            }
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#themeToggle')) {
                this.toggleTheme();
            }
            
            // Voice toggle
            if (e.target.closest('#voiceToggle')) {
                this.toggleVoice();
            }
        });

        // Language selector
        document.addEventListener('change', (e) => {
            if (e.target.matches('#languageSelect')) {
                this.changeLanguage(e.target.value);
            }
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    toggleVoice() {
        const voiceEnabled = localStorage.getItem('voiceEnabled') !== 'false';
        localStorage.setItem('voiceEnabled', !voiceEnabled);
        const voiceBtn = document.getElementById('voiceToggle');
        if (voiceBtn) {
            voiceBtn.classList.toggle('active', !voiceEnabled);
            // Notify user
            this.showNotification(`Voice ${!voiceEnabled ? 'enabled' : 'disabled'}`);
        }
    }

    async changeLanguage(lang) {
        // Save preference
        localStorage.setItem('preferredLanguage', lang);
        
        // Update UI
        document.documentElement.lang = lang;
        
        // If TradingBrain is available, update translations
        if (window.tradingBrain && typeof window.tradingBrain.setLanguage === 'function') {
            window.tradingBrain.setLanguage(lang);
        }
        
        // Reload translations
        await this.loadTranslations(lang);
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            const translations = await response.json();
            this.applyTranslations(translations);
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    applyTranslations(translations) {
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.headerManager = new HeaderManager();
});
