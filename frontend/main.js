// Panchmukhi Trading Brain Pro - Main JavaScript
class TradingBrainApp {
    constructor() {
        this.currentLanguage = 'en';
        this.voiceSettings = {
            enabled: true,
            volume: 0.75,
            language: 'en'
        };
        this.marketData = {};
        this.fusionScore = 0.75;
        this.signals = [];
        this.chart = null;
        this.ws = null;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeLanguage();
        this.initializeParticles();
        this.initializeTypedText();
        this.initializeMarketChart();
        this.initializeWebSocket();
        this.initializeServiceWorker();
        this.startRealTimeUpdates();
        this.setupScrollAnimations();
        this.setupVoiceRecognition();
        this.initializePWA();
    }

    // Safe DOM getter to avoid runtime errors when elements are absent
    safeGet(id) {
        try {
            return document.getElementById(id);
        } catch (err) {
            return null;
        }
    }

    // Language Management
    initializeLanguage() {
        const savedLang = localStorage.getItem('tradingBrainLanguage') || 'en';
        this.setLanguage(savedLang);

        const langEl = this.safeGet('languageSelect');
        if (langEl) {
            // ensure the select reflects saved language
            try { langEl.value = savedLang; } catch (e) {}
            // bind change handler only once
            try {
                if (!langEl.dataset.langBound) {
                    langEl.addEventListener('change', (e) => {
                        this.setLanguage(e.target.value);
                    });
                    langEl.dataset.langBound = '1';
                }
            } catch (err) { console.warn('language select bind failed', err); }

            // replace native select with a custom-styled dropdown for consistent theming
            try {
                this.replaceSelectWithCustomDropdown(langEl);
            } catch (err) {
                // fallback silently if custom dropdown cannot be created
                console.warn('Custom language dropdown initialization failed', err);
            }
        }
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('tradingBrainLanguage', lang);
        const langEl = this.safeGet('languageSelect');
        if (langEl) {
            try { langEl.value = lang; } catch (e) {}
        }
        
        // Update all translatable elements
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (this.translations[lang] && this.translations[lang][key]) {
                element.textContent = this.translations[lang][key];
            }
        });

        // Update voice language
        this.voiceSettings.language = lang;
        this.speakText(`Language changed to: ${this.getLanguageName(lang)}`);
    }

    // Replace a native <select> with a custom-styled dropdown (keeps original select in sync)
    replaceSelectWithCustomDropdown(selectEl) {
        if (!selectEl || selectEl.dataset.customized === '1') return;

        // mark as customized to avoid double initialization
        selectEl.dataset.customized = '1';

        // hide native select but keep it in the DOM for form compatibility
        selectEl.style.position = 'absolute';
        selectEl.style.left = '-9999px';
        selectEl.setAttribute('aria-hidden', 'true');

        // wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper glass-card';
        wrapper.style.position = 'relative';
        wrapper.style.display = getComputedStyle(selectEl).display || 'inline-block';
        wrapper.style.verticalAlign = 'middle';
        wrapper.style.minWidth = selectEl.offsetWidth ? (selectEl.offsetWidth + 'px') : '120px';

        // trigger button
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-select-trigger px-3 py-2 text-sm rounded-lg';
        trigger.style.display = 'flex';
        trigger.style.alignItems = 'center';
        trigger.style.justifyContent = 'space-between';
        trigger.style.width = '100%';
        trigger.style.gap = '8px';
        trigger.style.cursor = 'pointer';
        trigger.style.border = 'none';
        trigger.style.background = 'transparent';
        trigger.style.color = 'inherit';

        const caret = document.createElement('span');
        caret.innerHTML = '\u25BE';
        caret.style.marginLeft = '8px';
        caret.style.opacity = '0.9';

        // options container
        const list = document.createElement('ul');
        list.className = 'custom-select-options';
        list.style.listStyle = 'none';
        list.style.margin = '6px 0 0 0';
        list.style.padding = '6px 4px';
        list.style.position = 'absolute';
        list.style.right = '0';
        list.style.top = '100%';
        list.style.minWidth = '160px';
        list.style.background = 'rgba(0,0,0,0.7)';
        list.style.color = '#fff';
        list.style.borderRadius = '10px';
        list.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        list.style.zIndex = '1200';
        list.style.display = 'none';
        list.style.maxHeight = '220px';
        list.style.overflow = 'auto';

        // populate options
        Array.from(selectEl.options).forEach(opt => {
            const li = document.createElement('li');
            li.className = 'custom-select-option px-3 py-2 rounded';
            li.style.padding = '8px 12px';
            li.style.cursor = 'pointer';
            li.style.whiteSpace = 'nowrap';
            li.style.userSelect = 'none';
            li.textContent = opt.textContent;
            li.dataset.value = opt.value;
            if (opt.selected) {
                trigger.textContent = opt.textContent;
            }
            li.addEventListener('click', (e) => {
                const val = e.currentTarget.dataset.value;
                // update native select
                try { selectEl.value = val; } catch (er) {}
                // dispatch change
                const changeEvent = new Event('change', { bubbles: true });
                selectEl.dispatchEvent(changeEvent);
                // update trigger text
                trigger.textContent = e.currentTarget.textContent;
                trigger.appendChild(caret);
                // close list
                list.style.display = 'none';
            });
            li.addEventListener('mouseenter', () => {
                li.style.background = 'rgba(255,255,255,0.06)';
            });
            li.addEventListener('mouseleave', () => {
                li.style.background = 'transparent';
            });
            list.appendChild(li);
        });

        // if no option selected yet, set first
        if (!trigger.textContent) {
            const firstOpt = selectEl.options[0];
            if (firstOpt) trigger.textContent = firstOpt.textContent;
        }
        trigger.appendChild(caret);

        // toggling
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (list.style.display === 'none') {
                list.style.display = 'block';
            } else {
                list.style.display = 'none';
            }
        });

        // close when clicking outside
        document.addEventListener('click', () => { list.style.display = 'none'; });

        // assemble
        wrapper.appendChild(trigger);
        wrapper.appendChild(list);
        selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

        // inject minimal styles for better look (only once)
        if (!document.getElementById('custom-select-styles')) {
            const style = document.createElement('style');
            style.id = 'custom-select-styles';
            style.textContent = `
                .custom-select-wrapper { min-width: 140px; }
                .custom-select-trigger { padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); }
                .custom-select-options li { transition: background .12s ease; }
            `;
            document.head.appendChild(style);
        }
    }

    getLanguageName(lang) {
        const names = {
            'mr': 'Marathi',
            'hi': 'Hindi',
            'en': 'English',
            'gu': 'Gujarati',
            'kn': 'Kannada'
        };
        return names[lang] || 'Marathi';
    }

    translations = {
        mr: {
            'dashboard': 'डॅशबोर्ड',
            'sectors': 'सेक्टर विश्लेषण',
            'ipo': 'IPO विश्लेषण',
            'news-mgmt': 'समाचार व्यवस्थापन',
            'admin': 'ॲडमिन पॅनेल',
            'alerts': 'अलर्ट्स',
            'voice': 'व्हॉइस अलर्ट्स',
            'theme': 'थीम',
            'hero-desc': '५ दिशांनी डेटा घेऊन AI-आधारित एकच BUY/SELL अलर्ट. ISRO उपग्रह डेटा, मराठी बातम्या, ऑप्शन्स फ्लो, वेब स्क्रॅपिंग, आणि सोशल मीडिया विश्लेषण एकाच प्लॅटफॉर्मवर.',
            'start-trading': 'ट्रेडिंग सुरू करा',
            'watch-demo': 'डेमो पहा',
            'live-dashboard': 'रिअल-टाईम डॅशबोर्ड',
            'dashboard-desc': '५ डेटा स्रोतांचे लाईव्ह विश्लेषण आणि AI-आधारित फ्युजन स्कोर',
            'fusion-score': 'फ्युजन स्कोर',
            'satellite-data': 'ISRO उपग्रह डेटा',
            'news-analysis': 'मराठी बातम्या विश्लेषण',
            'options-flow': 'ऑप्शन्स फ्लो डेटा',
            'web-scraping': 'वेब स्क्रॅपिंग',
            'social-sentiment': 'सोशल मीडिया भावना',
            'heat-index': 'उष्णता निर्देशांक',
            'activity-level': 'ऍक्टिव्हिटी लेव्हल',
            'confidence': 'विश्वास',
            'sentiment': 'भावना',
            'articles': 'लेख संख्या',
            'trending': 'ट्रेंडिंग',
            'fii-flow': 'FII फ्लो',
            'dii-flow': 'DII फ्लो',
            'net-flow': 'नेट फ्लो',
            'trending-products': 'ट्रेंडिंग उत्पादने',
            'consumer-sentiment': 'ग्राहक भावना',
            'market-share': 'मार्केट शेअर',
            'bullish': 'बुलिश',
            'bearish': 'बेअरिश',
            'neutral': 'न्यूट्रल',
            'market-chart': 'मार्केट चार्ट',
            'trading-signals': 'ट्रेडिंग सिग्नल्स',
            'symbol': 'चिन्ह',
            'signal': 'सिग्नल',
            'entry': 'एन्ट्री',
            'target': 'टार्गेट',
            'stop-loss': 'स्टॉप-लॉस',
            'advanced-features': 'अ‍ॅडव्हान्स्ड फीचर्स',
            'features-desc': 'AI-आधारित ट्रेडिंग साधने जी भारतीय मार्केटसाठी विशेषतः तयार केली आहेत',
            'ai-prediction': 'AI भविष्यवाणी',
            'ai-prediction-desc': 'LSTM न्यूरल नेटवर्क्स वापरून ९५% अचूकतेने मार्केट चाली भाकित करणे',
            'learn-more': 'अधिक जाणून घ्या →',
            'voice-alerts': 'व्हॉइस अलर्ट्स',
            'voice-alerts-desc': 'मराठी भाषेमध्ये रिअल-टाईम ऑडिओ सिग्नल्स आणि मार्केट अपडेट्स',
            'try-now': 'आता प्रयत्न करा →',
            'options-builder': 'ऑप्शन्स बिल्डर',
            'options-builder-desc': 'प्रीमियम कॅल्क्युलेटरसह अ‍ॅडव्हान्स्ड ऑप्शन्स स्ट्रॅटेजी बिल्डर',
            'explore': 'एक्सप्लोर करा →',
            'technical-analysis': 'तांत्रिक विश्लेषण',
            'technical-analysis-desc': '५०+ तांत्रिक इंडिकेटर्स आणि कस्टम चार्टिंग साधने',
            'view-charts': 'चार्ट्स पहा →',
            'risk-management': 'जोखीम व्यवस्थापन',
            'risk-management-desc': 'AI-आधारित डायनॅमिक स्टॉप-लॉस आणि पोर्टफोलिओ ऑप्टिमायझेशन',
            'secure-trading': 'सुरक्षित ट्रेडिंग →',
            'multi-language': 'बहुभाषिक समर्थन',
            'multi-language-desc': 'मराठी, हिंदी, इंग्रजी, ગુજરાતી, ಕನ್ನಡ भाषांमध्ये संपूर्ण प्लॅटफॉर्म',
            'change-language': 'भाषा बदला →',
            'voice-settings': 'व्हॉइस सेटिंग्ज',
            'volume': 'व्हॉल्यूम',
            'language': 'भाषा',
            'cancel': 'रद्द करा',
            'save': 'जतन करा',
            'install-app': 'अ‍ॅप इंस्टॉल करा',
            'install-desc': 'पंचमुखी ट्रेडिंग ब्रेन प्रो अ‍ॅप इंस्टॉल करा',
            'install': 'इंस्टॉल',
            'market-data': 'मार्केट डेटा',
            'news-updates': 'बातम्या अपडेट्स',
            'price-alerts': 'किंमत अलर्ट्स',
            'portfolio': 'पोर्टफोलिओ',
            'settings': 'सेटिंग्ज'
        },
        hi: {
            'dashboard': 'डैशबोर्ड',
            'sectors': 'सेक्टर विश्लेषण',
            'ipo': 'IPO विश्लेषण',
            'news-mgmt': 'समाचार प्रबंधन',
            'admin': 'एडमिन पैनल',
            'alerts': 'अलर्ट्स',
            'voice': 'वॉइस अलर्ट्स',
            'theme': 'थीम',
            'hero-desc': '५ दिशाओं से डेटा लेकर AI-आधारित एक ही BUY/SELL अलर्ट. ISRO उपग्रह डेटा, हिंदी समाचार, ऑप्शन्स फ्लो, वेब स्क्रैपिंग, और सोशल मीडिया विश्लेषण एक ही प्लेटफॉर्म पर.',
            'start-trading': 'ट्रेडिंग शुरू करें',
            'watch-demo': 'डेमो देखें',
            'live-dashboard': 'रियल-टाइम डैशबोर्ड',
            'dashboard-desc': '५ डेटा स्रोतों का लाइव विश्लेषण और AI-आधारित फ्यूजन स्कोर',
            'fusion-score': 'फ्यूजन स्कोर',
            'satellite-data': 'ISRO उपग्रह डेटा',
            'news-analysis': 'हिंदी समाचार विश्लेषण',
            'options-flow': 'ऑप्शन्स फ्लो डेटा',
            'web-scraping': 'वेब स्क्रैपिंग',
            'social-sentiment': 'सोशल मीडिया भावना',
            'heat-index': 'ऊष्मा सूचकांक',
            'activity-level': 'गतिविधि स्तर',
            'confidence': 'विश्वास',
            'sentiment': 'भावना',
            'articles': 'लेख संख्या',
            'trending': 'ट्रेंडिंग',
            'fii-flow': 'FII फ्लो',
            'dii-flow': 'DII फ्लो',
            'net-flow': 'नेट फ्लो',
            'trending-products': 'ट्रेंडिंग उत्पाद',
            'consumer-sentiment': 'उपभोक्ता भावना',
            'market-share': 'मार्केट शेयर',
            'bullish': 'बुलिश',
            'bearish': 'बेअरिश',
            'neutral': 'न्यूट्रल',
            'market-chart': 'मार्केट चार्ट',
            'trading-signals': 'ट्रेडिंग सिग्नल्स',
            'symbol': 'चिन्ह',
            'signal': 'सिग्नल',
            'entry': 'एन्ट्री',
            'target': 'लक्ष्य',
            'stop-loss': 'स्टॉप-लॉस',
            'advanced-features': 'एडवांस्ड फीचर्स',
            'features-desc': 'AI-आधारित ट्रेडिंग उपकरण जो भारतीय बाजार के लिए विशेष रूप से तैयार किए गए हैं',
            'ai-prediction': 'AI भविष्यवाणी',
            'ai-prediction-desc': 'LSTM न्यूरल नेटवर्क्स का उपयोग करके ९५% सटीकता से मार्केट चालों की भविष्यवाणी',
            'learn-more': 'अधिक जानें →',
            'voice-alerts': 'वॉइस अलर्ट्स',
            'voice-alerts-desc': 'हिंदी भाषा में रियल-टाइम ऑडियो सिग्नल्स और मार्केट अपडेट्स',
            'try-now': 'अभी प्रयास करें →',
            'options-builder': 'ऑप्शन्स बिल्डर',
            'options-builder-desc': 'प्रीमियम कैलकुलेटर के साथ एडवांस्ड ऑप्शन्स रणनीति बिल्डर',
            'explore': 'एक्सप्लोर करें →',
            'technical-analysis': 'तकनीकी विश्लेषण',
            'technical-analysis-desc': '५०+ तकनीकी इंडिकेटर्स और कस्टम चार्टिंग उपकरण',
            'view-charts': 'चार्ट्स देखें →',
            'risk-management': 'जोखिम प्रबंधन',
            'risk-management-desc': 'AI-आधारित डायनामिक स्टॉप-लॉस और पोर्टफोलिओ ऑप्टिमाइजेशन',
            'secure-trading': 'सुरक्षित ट्रेडिंग →',
            'multi-language': 'बहुभाषिक समर्थन',
            'multi-language-desc': 'मराठी, हिंदी, इंग्लिश, ગુજરાતી, ಕನ್ನಡ भाषाओं में संपूर्ण प्लेटफॉर्म',
            'change-language': 'भाषा बदलें →',
            'voice-settings': 'वॉइस सेटिंग्ज',
            'volume': 'वॉल्यूम',
            'language': 'भाषा',
            'cancel': 'रद्द करें',
            'save': 'सहेजें',
            'install-app': 'ऐप इंस्टॉल करें',
            'install-desc': 'पंचमुखी ट्रेडिंग ब्रेन प्रो ऐप इंस्टॉल करें',
            'install': 'इंस्टॉल',
            'market-data': 'मार्केट डेटा',
            'news-updates': 'समाचार अपडेट्स',
            'price-alerts': 'कीमत अलर्ट्स',
            'portfolio': 'पोर्टफोलिओ',
            'settings': 'सेटिंग्ज'
        },
        en: {
            'dashboard': 'Dashboard',
            'sectors': 'Sector Analysis',
            'ipo': 'IPO Analysis',
            'news-mgmt': 'News Management',
            'admin': 'Admin Panel',
            'alerts': 'Alerts',
            'voice': 'Voice Alerts',
            'theme': 'Theme',
            'hero-desc': 'AI-powered single BUY/SELL alert from 5 data sources. ISRO satellite data, multi-language news, options flow, web scraping, and social media analysis in one platform.',
            'start-trading': 'Start Trading',
            'watch-demo': 'Watch Demo',
            'live-dashboard': 'Real-Time Dashboard',
            'dashboard-desc': 'Live analysis of 5 data sources and AI-powered fusion score',
            'fusion-score': 'Fusion Score',
            'satellite-data': 'ISRO Satellite Data',
            'news-analysis': 'Multi-Language News Analysis',
            'options-flow': 'Options Flow Data',
            'web-scraping': 'Web Scraping',
            'social-sentiment': 'Social Media Sentiment',
            'heat-index': 'Heat Index',
            'activity-level': 'Activity Level',
            'confidence': 'Confidence',
            'sentiment': 'Sentiment',
            'articles': 'Articles Count',
            'trending': 'Trending',
            'fii-flow': 'FII Flow',
            'dii-flow': 'DII Flow',
            'net-flow': 'Net Flow',
            'trending-products': 'Trending Products',
            'consumer-sentiment': 'Consumer Sentiment',
            'market-share': 'Market Share',
            'bullish': 'Bullish',
            'bearish': 'Bearish',
            'neutral': 'Neutral',
            'market-chart': 'Market Chart',
            'trading-signals': 'Trading Signals',
            'symbol': 'Symbol',
            'signal': 'Signal',
            'entry': 'Entry',
            'target': 'Target',
            'stop-loss': 'Stop-Loss',
            'advanced-features': 'Advanced Features',
            'features-desc': 'AI-powered trading tools specially designed for Indian markets',
            'ai-prediction': 'AI Prediction',
            'ai-prediction-desc': '95% accurate market prediction using LSTM neural networks',
            'learn-more': 'Learn More →',
            'voice-alerts': 'Voice Alerts',
            'voice-alerts-desc': 'Real-time audio signals and market updates in multiple languages',
            'try-now': 'Try Now →',
            'options-builder': 'Options Builder',
            'options-builder-desc': 'Advanced options strategy builder with premium calculator',
            'explore': 'Explore →',
            'technical-analysis': 'Technical Analysis',
            'technical-analysis-desc': '50+ technical indicators and custom charting tools',
            'view-charts': 'View Charts →',
            'risk-management': 'Risk Management',
            'risk-management-desc': 'AI-powered dynamic stop-loss and portfolio optimization',
            'secure-trading': 'Secure Trading →',
            'multi-language': 'Multi-Language Support',
            'multi-language-desc': 'Complete platform in Marathi, Hindi, English, Gujarati, Kannada',
            'change-language': 'Change Language →',
            'voice-settings': 'Voice Settings',
            'volume': 'Volume',
            'language': 'Language',
            'cancel': 'Cancel',
            'save': 'Save',
            'install-app': 'Install App',
            'install-desc': 'Install Panchmukhi Trading Brain Pro app',
            'install': 'Install',
            'market-data': 'Market Data',
            'news-updates': 'News Updates',
            'price-alerts': 'Price Alerts',
            'portfolio': 'Portfolio',
            'settings': 'Settings'
        },
        gu: {
            'dashboard': 'ડેશબોર્ડ',
            'sectors': 'સેક્ટર વિશ્લેષણ',
            'ipo': 'IPO વિશ્લેષણ',
            'news-mgmt': 'સમાચાર વ્યવસ્થાપન',
            'admin': 'એડમિન પેનલ',
            'alerts': 'સંકેતો',
            'voice': 'વોઇસ સંકેતો',
            'theme': 'થીમ',
            'start-trading': 'ટ્રેડિંગ શરુ કરો',
            'watch-demo': 'ડેમો જુઓ',
            'language': 'ભાષા',
            'cancel': 'રદ્દ કરો',
            'save': 'સાચવો',
            'settings': 'સેટિંગ્સ'
        },
        kn: {
            'dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            'sectors': 'ವಲಯ ವಿಶ್ಲೇಷಣ',
            'ipo': 'IPO ವಿಶ್ಲೇಷಣ',
            'news-mgmt': 'ಸುದ್ದಿ ನಿರ್ವಹಣೆ',
            'admin': 'ಆಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್',
            'alerts': 'ಸೂಚನೆಗಳು',
            'voice': 'ವಾಯ್ಸ್ ಸೂಚನೆಗಳು',
            'theme': 'ಥೀಮ್',
            'start-trading': 'ವ್ಯಾಪಾರ ಪ್ರಾರಂಭಿಸಿ',
            'watch-demo': 'ಡೆಮೋ ವೀಕ್ಷಿಸಿ',
            'language': 'ಭಾಷೆ',
            'cancel': 'ರದ್ದುಮಾಡಿ',
            'save': 'ಉಳಿಸಿ',
            'settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'
        }
    };

    // Particle System
    initializeParticles() {
        if (typeof p5 === 'undefined') return;
        const particlesContainer = this.safeGet('particles');
        if (!particlesContainer) return;

        new p5((p) => {
            let particles = [];
            let connections = [];
            
            p.setup = () => {
                let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('particles');
                canvas.style('position', 'absolute');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '1');
                
                // Create intelligent particles
                for (let i = 0; i < 80; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.8, 0.8),
                        vy: p.random(-0.8, 0.8),
                        size: p.random(3, 8),
                        opacity: p.random(0.4, 0.9),
                        intelligence: p.random(0.1, 1.0),
                        connections: []
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update particles with AI-like behavior
                particles.forEach((particle, i) => {
                    // Smart movement with market data influence
                    particle.x += particle.vx * (1 + particle.intelligence * 0.5);
                    particle.y += particle.vy * (1 + particle.intelligence * 0.5);
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle with intelligence-based color
                    let hue = 20 + particle.intelligence * 40; // Orange to yellow
                    p.fill(hue, 80, 60, particle.opacity * 100);
                    p.noStroke();
                    p.circle(particle.x, particle.y, particle.size);
                    
                    // Smart connections
                    particles.forEach((other, j) => {
                        if (i !== j) {
                            let distance = p.dist(particle.x, particle.y, other.x, other.y);
                            if (distance < 120 && Math.abs(particle.intelligence - other.intelligence) < 0.3) {
                                let alpha = (1 - distance/120) * 30 * Math.min(particle.intelligence, other.intelligence);
                                p.stroke(hue, 80, 60, alpha);
                                p.strokeWeight(0.5 + particle.intelligence * 1.5);
                                p.line(particle.x, particle.y, other.x, other.y);
                            }
                        }
                    });
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        });
    }

    // Typed Text Animation
    initializeTypedText() {
        const typedEl = document.querySelector('#typed-text');
        if (typedEl && typeof Typed !== 'undefined') {
            new Typed('#typed-text', {
                strings: [
                    'Panch Mukhi Trading Brain ',
                    '5 Data Sources + AI = One Signal',
                    '🛰️ ISRO + AI = Profit',
                    'India Advanced AI '
                ],
                typeSpeed: 60,
                backSpeed: 40,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|',
                autoInsertCss: true
            });
        }
    }

    // Market Chart Initialization
    initializeMarketChart() {
        const chartDom = this.safeGet('marketChart');
        if (!chartDom || typeof echarts === 'undefined') return;
        this.chart = echarts.init(chartDom, 'dark');
        
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: this.generateTimeData(),
                axisLine: { lineStyle: { color: '#444' } },
                axisLabel: { color: '#888' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#444' } },
                axisLabel: { color: '#888' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                name: 'NIFTY 50',
                type: 'candlestick',
                data: this.generateCandlestickData(),
                itemStyle: {
                    color: '#22C55E',
                    color0: '#EF4444',
                    borderColor: '#22C55E',
                    borderColor0: '#EF4444'
                }
            }],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#FF6B35',
                textStyle: { color: '#fff' }
            }
        };
        
        this.chart.setOption(option);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.chart.resize();
        });
    }

    generateTimeData() {
        const times = [];
        const now = new Date();
        for (let i = 30; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 5 * 60000); // 5 minute intervals
            times.push(time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
        }
        return times;
    }

    generateCandlestickData() {
        const data = [];
        let basePrice = 17850;
        
        for (let i = 0; i < 31; i++) {
            const open = basePrice + (Math.random() - 0.5) * 50;
            const close = open + (Math.random() - 0.5) * 100;
            const high = Math.max(open, close) + Math.random() * 30;
            const low = Math.min(open, close) - Math.random() * 30;
            
            data.push([open, close, low, high]);
            basePrice = close;
        }
        
        return data;
    }

    // WebSocket for real-time data
    initializeWebSocket() {
        if (this.ws) {
            this.ws.close();
        }
        
        // Simulate WebSocket connection
        this.ws = {
            readyState: 1, // OPEN
            send: (data) => {
                console.log('WebSocket send:', data);
            },
            close: () => {
                console.log('WebSocket closed');
            }
        };
        
        // Simulate real-time updates
        setInterval(() => {
            this.updateMarketData();
        }, 2000);
    }

    updateMarketData() {
        // Update fusion score
        this.fusionScore = 0.5 + Math.random() * 0.5;
        const fusionEl = this.safeGet('fusionScore');
        if (fusionEl) fusionEl.textContent = this.fusionScore.toFixed(2);

        // Update fusion circle
        const circle = this.safeGet('fusionCircle');
        if (circle) {
            try {
                const circumference = 2 * Math.PI * 56;
                const offset = circumference - (this.fusionScore * circumference);
                circle.style.strokeDashoffset = offset;
            } catch (e) { /* ignore */ }
        }

        // Update signal
        const signal = this.safeGet('fusionSignal');
        const confidence = this.safeGet('fusionConfidence');

        if (signal) {
            if (this.fusionScore > 0.7) {
                signal.textContent = 'BUY';
                signal.className = 'text-2xl font-bold signal-buy';
            } else if (this.fusionScore < 0.3) {
                signal.textContent = 'SELL';
                signal.className = 'text-2xl font-bold signal-sell';
            } else {
                signal.textContent = 'HOLD';
                signal.className = 'text-2xl font-bold signal-hold';
            }
        }

        if (confidence) {
            const conf = Math.abs(this.fusionScore - 0.5) * 2 * 100;
            confidence.textContent = `Confidence: ${conf.toFixed(0)}%`;
        }
        
        // Update data cards with animation
        this.updateDataCards();
        
        // Voice alerts for significant changes
        if (this.voiceSettings.enabled && Math.random() > 0.8) {
            this.speakMarketUpdate();
        }
    }

    updateDataCards() {
        const cards = document.querySelectorAll('.data-card');
        cards.forEach((card, index) => {
            const progressBar = card.querySelector('.bg-blue-500, .bg-green-500, .bg-purple-500, .bg-orange-500, .bg-pink-500');
            if (progressBar) {
                const newWidth = 50 + Math.random() * 50;
                progressBar.style.width = `${newWidth}%`;
                
                // Add pulse animation
                card.classList.add('pulse-animation');
                setTimeout(() => {
                    card.classList.remove('pulse-animation');
                }, 1000);
            }
        });
    }

    // Voice Recognition and Alerts
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'mr-IN';
            
            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
            };
        }
    }

    processVoiceCommand(command) {
        console.log('Voice command:', command);
        
        if (command.includes('buy') || command.includes('buying') || command.includes('खरेदी')) {
            this.speakText('खरेदी सिग्नल नोंदवल');
        } else if (command.includes('sell') || command.includes('selling') || command.includes('विक्री')) {
            this.speakText('विक्री सिग्नल नोंदवल');
        } else if (command.includes('market') || command.includes('बाजार')) {
            this.speakMarketUpdate();
        } else if (command.includes('help') || command.includes('मदत')) {
            this.speakText('मी आपल्या सेवेत आहे. खरेदी, विक्री, किंवा मार्केट माहितीसाठी सांगा.');
        }
    }

    speakText(text) {
        if (!this.voiceSettings.enabled) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.voiceSettings.language === 'mr' ? 'mr-IN' : 
                         this.voiceSettings.language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.volume = this.voiceSettings.volume;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
    }

    speakMarketUpdate() {
        const updates = [
            `फ्युजन स्कोर ${this.fusionScore.toFixed(2)} आहे`,
            `बाजारात सध्या ${this.fusionScore > 0.7 ? 'बुलिश' : this.fusionScore < 0.3 ? 'बेअरिश' : 'न्यूट्रल'} ट्रेंड आहे`,
            'रिलायन्स आणि TCS यामध्ये चांगली हालचाल दिसतेय',
            'FII फ्लो पॉझिटिव्ह आहे'
        ];
        
        const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
        this.speakText(randomUpdate);
    }

    // Event Listeners
    setupEventListeners() {
        // Voice toggle
        const voiceToggle = this.safeGet('voiceToggle');
        const voiceModal = this.safeGet('voiceModal');
        if (voiceToggle && voiceModal) {
            if (!voiceToggle.dataset.bound) {
                voiceToggle.addEventListener('click', () => {
                    voiceModal.classList.remove('hidden');
                });
                voiceToggle.dataset.bound = '1';
            }
        }

        // Voice modal controls
        const closeVoiceModal = this.safeGet('closeVoiceModal');
        const saveVoiceSettings = this.safeGet('saveVoiceSettings');
        if (closeVoiceModal && voiceModal) {
            if (!closeVoiceModal.dataset.bound) {
                closeVoiceModal.addEventListener('click', () => {
                    voiceModal.classList.add('hidden');
                });
                closeVoiceModal.dataset.bound = '1';
            }
        }

        if (saveVoiceSettings) {
            if (!saveVoiceSettings.dataset.bound) {
                saveVoiceSettings.addEventListener('click', () => {
                    const alertsToggle = this.safeGet('voiceAlertsToggle');
                    const volumeEl = this.safeGet('voiceVolume');
                    const langEl = this.safeGet('voiceLanguage');

                    this.voiceSettings.enabled = alertsToggle ? alertsToggle.checked : this.voiceSettings.enabled;
                    this.voiceSettings.volume = volumeEl ? (volumeEl.value / 100) : this.voiceSettings.volume;
                    this.voiceSettings.language = langEl ? langEl.value : this.voiceSettings.language;

                    try { localStorage.setItem('voiceSettings', JSON.stringify(this.voiceSettings)); } catch (e) {}
                    if (voiceModal) voiceModal.classList.add('hidden');
                    this.speakText('व्हॉइस सेटिंग्ज जतन केली');
                });
                saveVoiceSettings.dataset.bound = '1';
            }
        }

        // Theme toggle
        const themeToggle = this.safeGet('themeToggle');
        if (themeToggle) {
            if (!themeToggle.dataset.bound) {
                themeToggle.addEventListener('click', () => this.toggleTheme());
                themeToggle.dataset.bound = '1';
            }
        }

        // Chart controls
        const symbolSelect = this.safeGet('symbolSelect');
        if (symbolSelect) symbolSelect.addEventListener('change', (e) => this.updateChartSymbol(e.target.value));

        const timeframeSelect = this.safeGet('timeframeSelect');
        if (timeframeSelect) timeframeSelect.addEventListener('change', (e) => this.updateChartTimeframe(e.target.value));

        // Voice activation on spacebar (safe)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                if (this.recognition) {
                    try { this.recognition.start(); } catch (err) {}
                    this.speakText('आवाज ऐकण्यासाठी तयार');
                }
            }
        });

        // Navigation smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Header auto-hide on scroll (hide when scrolling down, show when scrolling up or near top)
    setupHeaderAutoHide() {
        try {
            const header = document.querySelector('nav.nav-blur');
            if (!header) return;
            if (header.dataset.autohide === '1') return; // already bound
            header.dataset.autohide = '1';

            // ensure transition
            header.style.transition = header.style.transition ? header.style.transition + ', transform 0.25s ease' : 'transform 0.25s ease';
            header.style.willChange = 'transform';

            let lastScroll = window.pageYOffset || document.documentElement.scrollTop;

            const onScroll = () => {
                const current = window.pageYOffset || document.documentElement.scrollTop;
                // small threshold to avoid jitter
                if (Math.abs(current - lastScroll) < 6) return;

                if (current > lastScroll && current > 100) {
                    // scrolling down -> hide
                    header.style.transform = 'translateY(-120%)';
                } else {
                    // scrolling up or near top -> show
                    header.style.transform = 'translateY(0)';
                }

                lastScroll = current;
            };

            window.addEventListener('scroll', onScroll, { passive: true });

            // show when mouse near top (helpful on desktop)
            window.addEventListener('mousemove', (e) => {
                try {
                    if (e.clientY <= 48) header.style.transform = 'translateY(0)';
                } catch (e) { /* ignore */ }
            });

            // Ensure header is visible on resize/top
            window.addEventListener('resize', () => { header.style.transform = 'translateY(0)'; });
        } catch (e) {
            console.warn('setupHeaderAutoHide error', e);
        }
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        }
        
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    updateChartSymbol(symbol) {
        // Update chart with new symbol data
        console.log('Updating chart symbol:', symbol);
        this.speakText(`${symbol} चार्ट अपडेट केला`);
    }

    updateChartTimeframe(timeframe) {
        // Update chart with new timeframe
        console.log('Updating chart timeframe:', timeframe);
        this.speakText(`टाईमफ्रेम बदलला: ${timeframe}`);
    }

    // Scroll Animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    // Real-time Updates
    startRealTimeUpdates() {
        // Update every 2 seconds
        setInterval(() => {
            this.updateFusionScore();
            this.updateTradingSignals();
            this.updateMarketIndicators();
        }, 2000);
        
        // Update every 30 seconds
        setInterval(() => {
            this.updateNewsFeed();
            this.updateSocialSentiment();
        }, 30000);
    }

    updateFusionScore() {
        const oldScore = this.fusionScore;
        this.fusionScore = 0.3 + Math.random() * 0.7;
        
        // Animate score change
        const scoreElement = this.safeGet('fusionScore');
        if (scoreElement) {
            anime({
                targets: scoreElement,
                innerHTML: [oldScore.toFixed(2), this.fusionScore.toFixed(2)],
                duration: 1000,
                easing: 'easeInOutQuad',
                round: 100
            });
        }

        // Update circle animation
        const circle = this.safeGet('fusionCircle');
        if (circle) {
            try {
                const circumference = 2 * Math.PI * 56;
                const offset = circumference - (this.fusionScore * circumference);
                anime({
                    targets: circle,
                    strokeDashoffset: offset,
                    duration: 1000,
                    easing: 'easeInOutQuad'
                });
            } catch (e) { /* ignore animation errors */ }
        }
    }

    updateTradingSignals() {
        const signals = [
            { symbol: 'RELIANCE', signal: 'BUY', entry: 2650, target: 2750, stopLoss: 2600, confidence: 85 },
            { symbol: 'TCS', signal: 'SELL', entry: 3850, target: 3750, stopLoss: 3900, confidence: 78 },
            { symbol: 'HDFC_BANK', signal: 'HOLD', entry: 1650, target: 1700, stopLoss: 1620, confidence: 65 },
            { symbol: 'INFY', signal: 'BUY', entry: 1450, target: 1500, stopLoss: 1420, confidence: 82 },
            { symbol: 'ICICI_BANK', signal: 'BUY', entry: 950, target: 1000, stopLoss: 920, confidence: 88 }
        ];
        
        const tableBody = this.safeGet('signalsTable');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        signals.forEach(signal => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-800 hover:bg-gray-800/50';
            
            const signalClass = signal.signal === 'BUY' ? 'signal-buy' : 
                               signal.signal === 'SELL' ? 'signal-sell' : 'signal-hold';
            
            row.innerHTML = `
                <td class="py-3 px-4 font-semibold">${signal.symbol}</td>
                <td class="py-3 px-4">
                    <span class="font-bold ${signalClass}">${signal.signal}</span>
                </td>
                <td class="py-3 px-4 mono-text">₹${signal.entry.toLocaleString('hi-IN')}</td>
                <td class="py-3 px-4 mono-text">₹${signal.target.toLocaleString('hi-IN')}</td>
                <td class="py-3 px-4 mono-text">₹${signal.stopLoss.toLocaleString('hi-IN')}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-16 bg-gray-700 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${signal.confidence}%"></div>
                        </div>
                        <span class="text-sm">${signal.confidence}%</span>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    updateMarketIndicators() {
        // Update various market indicators
        const indicators = {
            vix: 15 + Math.random() * 10,
            advanceDecline: 1.2 + Math.random() * 0.8,
            fiiFlow: 100 + Math.random() * 200,
            diiFlow: -50 + Math.random() * 100
        };
        
        // Store for voice alerts
        this.marketIndicators = indicators;
    }

    updateNewsFeed() {
        const newsItems = [
            "रिलायन्स इंडस्ट्रीजचा नेट प्रॉफिट १२% वाढला",
            "TCS ने नवीन शेअर बायबॅक जाहीर केला",
 "HDFC Bank चे Q3 निकाल अपेक्षेप्रमाणे",
            "इन्फोसिसने AI सेवा लाँच केली",
            "बाजारात नवीन उच्च स्तरांवर खरेदी"
        ];
        
        // Randomly update news sentiment
        if (Math.random() > 0.7) {
            this.speakText(newsItems[Math.floor(Math.random() * newsItems.length)]);
        }
    }

    updateSocialSentiment() {
        const sentiment = {
            bullish: 60 + Math.random() * 20,
            bearish: 20 + Math.random() * 15,
            neutral: 10 + Math.random() * 10
        };
        
        this.socialSentiment = sentiment;
    }

    // Service Worker for PWA
    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }

    // PWA Installation
    initializePWA() {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const installPrompt = this.safeGet('installPrompt');
            if (installPrompt) installPrompt.classList.remove('hidden');
        });

        const installApp = this.safeGet('installApp');
        const dismissInstall = this.safeGet('dismissInstall');
        const installPromptEl = this.safeGet('installPrompt');

        if (installApp) {
            installApp.addEventListener('click', async () => {
                if (deferredPrompt) {
                    try { deferredPrompt.prompt();
                        const result = await deferredPrompt.userChoice;
                        deferredPrompt = null;
                        if (installPromptEl) installPromptEl.classList.add('hidden');
                    } catch (e) { /* ignore */ }
                }
            });
        }

        if (dismissInstall && installPromptEl) {
            dismissInstall.addEventListener('click', () => {
                installPromptEl.classList.add('hidden');
            });
        }
    }

    // Utility Methods
    showNotification(title, body, icon = 'resources/icon.svg') {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: icon,
                badge: 'resources/badge.svg',
                tag: 'trading-alert'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('पंचमुखी ट्रेडिंग ब्रेन', 'अलर्ट्स सक्षम केले');
                }
            });
        }
    }

    // Load saved settings
    loadSettings() {
        const savedVoiceSettings = localStorage.getItem('voiceSettings');
        if (savedVoiceSettings) {
            this.voiceSettings = JSON.parse(savedVoiceSettings);
        }
        
        const savedLanguage = localStorage.getItem('tradingBrainLanguage');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
        }
        // Restore saved theme (light/dark)
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            } else if (savedTheme === 'dark') {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            }
        } catch (e) { /* ignore */ }
    }

    // Error Handling
    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly error message
        this.showNotification('त्रुटी', 'काही त्रुटी आली आहे. कृपया पृष्ठ रीफ्रेश करा.');
        
        // Log to analytics or error reporting service
        if (window.gtag) {
            window.gtag('event', 'error', {
                error_context: context,
                error_message: error.message
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.tradingBrain = new TradingBrainApp();
        
        // Request notification permission
        window.tradingBrain.requestNotificationPermission();
        
        // Load settings
        window.tradingBrain.loadSettings();
        
    } catch (error) {
        console.error('Failed to initialize Trading Brain App:', error);
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    window.tradingBrain.isOnline = true;
    window.tradingBrain.showNotification('कनेक्शन पुनर्स्थापित', 'आपण आता ऑनलाईन आहात');
});

window.addEventListener('offline', () => {
    window.tradingBrain.isOnline = false;
    window.tradingBrain.showNotification('कनेक्शन तुटले', 'काही फीचर्स ऑफलाईन असतील');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App is backgrounded');
    } else {
        console.log('App is foregrounded');
        window.tradingBrain.updateMarketData();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + K for search
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Focus search input if exists
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) searchInput.focus();
    }
    
    // Ctrl + / for voice commands
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        if (window.tradingBrain.recognition) {
            window.tradingBrain.recognition.start();
        }
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TradingBrainApp;
}

// If the shared header is inserted after app init, re-bind header controls
document.addEventListener('header-inserted', () => {
    try {
        if (window.tradingBrain) {
            // re-initialize language bindings and header-related event listeners
            window.tradingBrain.initializeLanguage();
            window.tradingBrain.setupEventListeners();
            // reload settings (theme/voice) to reflect UI state
            window.tradingBrain.loadSettings();
            // ensure header auto-hide behavior is bound
            if (typeof window.tradingBrain.setupHeaderAutoHide === 'function') {
                try { window.tradingBrain.setupHeaderAutoHide(); } catch (e) {}
            }
        }
    } catch (e) {
        console.warn('Error re-binding header controls after header-inserted', e);
    }
});