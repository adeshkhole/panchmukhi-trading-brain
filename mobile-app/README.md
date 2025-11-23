# Mobile App - Panchmukhi Trading Brain Pro 📱

## Overview

The mobile app is a **React Native application** built with **Expo**, providing iOS and Android access to the Panchmukhi Trading Brain platform. Features native performance, offline support, biometric authentication, and push notifications.

## Features

### 📲 Cross-Platform
- **iOS & Android**: Single codebase, native performance
- **Expo Managed**: No need for Xcode or Android Studio
- **OTA Updates**: Instant updates without App Store review

### 🔐 Security
- **Biometric Authentication**: Fingerprint/Face ID login
- **Secure Storage**: Encrypted credential storage
- **JWT Token Management**: Automatic token refresh
- **2FA Support**: SMS/Email verification

### 📊 Trading Features
- **Real-Time Charts**: TradingView integration
- **Price Alerts**: Custom price notifications
- **Portfolio Tracking**: Real-time P&L
- **Trading Signals**: AI-powered recommendations

### 📱 Mobile Optimizations
- **Offline Mode**: Access cached data when offline
- **Push Notifications**: Instant price and trade alerts
- **Dark Mode**: Automatic light/dark theme support
- **Responsive Design**: Optimized for all screen sizes

### 🌍 Multi-Language
- **5 Languages**: Marathi, Hindi, English, Gujarati, Kannada
- **Dynamic Switching**: Change language in-app
- **Voice Alerts**: TTS for notifications

---

## Project Structure

```
mobile-app/
├── App.js                          # Main entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config (optional)
│
├── src/
│   ├── screens/                    # Screen components
│   │   ├── DashboardScreen.js     # Main dashboard
│   │   ├── PortfolioScreen.js     # Holdings & P&L
│   │   ├── ChartsScreen.js        # Price charts
│   │   ├── AlertsScreen.js        # Alert management
│   │   ├── ProfileScreen.js       # User settings
│   │   └── LoginScreen.js         # Authentication
│   │
│   ├── components/                 # Reusable components
│   │   ├── PriceCard.js           # Display price quote
│   │   ├── ChartView.js           # Chart rendering
│   │   ├── AlertModal.js          # Alert management modal
│   │   ├── LanguageSelector.js    # Language switcher
│   │   └── ThemeToggle.js         # Dark/light mode
│   │
│   ├── services/                   # Business logic
│   │   ├── api.js                 # REST API client
│   │   ├── storage.js             # AsyncStorage utilities
│   │   ├── websocket.js           # WebSocket handler
│   │   ├── notifications.js       # Push notification setup
│   │   └── biometric.js           # Fingerprint/Face ID
│   │
│   ├── store/                      # Redux state management
│   │   ├── index.js               # Store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.js       # Auth state
│   │   │   ├── marketSlice.js     # Market data
│   │   │   ├── portfolioSlice.js  # Holdings
│   │   │   ├── alertSlice.js      # Alerts
│   │   │   └── uiSlice.js         # UI state (theme, language)
│   │   └── hooks.js               # Redux hooks
│   │
│   ├── navigation/                 # React Navigation
│   │   ├── AuthStack.js           # Login/Register screens
│   │   ├── MainStack.js           # Main app navigation
│   │   └── RootNavigator.js       # Top-level navigator
│   │
│   ├── utils/                      # Helper functions
│   │   ├── formatting.js          # Number/date formatting
│   │   ├── validation.js          # Input validation
│   │   └── constants.js           # App constants
│   │
│   ├── themes/                     # Theming
│   │   ├── colors.js              # Color palettes
│   │   ├── typography.js          # Font configurations
│   │   └── spacing.js             # Spacing scale
│   │
│   └── styles/                     # Global styles
│       └── global.js              # Global stylesheet
│
├── assets/
│   ├── images/                    # PNG, JPG, SVG assets
│   ├── fonts/                     # Custom fonts
│   └── icons/                     # Icon assets
│
└── __tests__/                     # Jest test files
    ├── services.test.js
    ├── store.test.js
    └── components.test.js
```

---

## Technology Stack

### Core Framework
- **React Native 0.71+**: Mobile app framework
- **Expo 48+**: Managed React Native service
- **TypeScript** (optional): Type-safe JavaScript

### State Management
- **Redux Toolkit**: Predictable state container
- **Redux Persist**: Persist Redux state to device storage

### Navigation
- **React Navigation 6.x**: Routing and navigation
- **React Navigation Stack**: Screen stacking
- **React Navigation Bottom Tabs**: Tab navigation

### UI Components
- **React Native Paper**: Material Design UI library
- **React Native Vector Icons**: Icon library
- **React Native SVG**: SVG rendering

### Charts & Visualization
- **react-native-chart-kit**: Mobile charts
- **react-native-canvas**: Canvas drawing (optional)

### API & Real-Time
- **Axios**: HTTP client
- **Socket.IO Client**: WebSocket alternative (optional)
- **native WebSocket**: Built-in WebSocket

### Storage & Authentication
- **AsyncStorage**: Local data persistence
- **React Native Keychain**: Secure credential storage
- **Expo Local Authentication**: Biometric auth

### Notifications
- **Expo Notifications**: Push notification service
- **Expo Tasks**: Background task execution

### Testing
- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing

---

## Installation & Setup

### Prerequisites
- Node.js 14.x+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for instant preview)

### Local Development

**1. Install dependencies:**
```bash
cd mobile-app
npm install
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env with API endpoint
```

**3. Start Expo development server:**
```bash
npm start
# Or: expo start
```

**4. Run on device/simulator:**

**iOS Simulator:**
```bash
# Press 'i' in Expo terminal
# Or: npm run ios
```

**Android Emulator:**
```bash
# Press 'a' in Expo terminal
# Or: npm run android
```

**Expo Go App:**
- Scan QR code with Expo Go app on phone
- Instant preview and hot reload

### Build for Production

**iOS:**
```bash
expo build:ios
# Creates .ipa file for App Store submission
```

**Android:**
```bash
expo build:android
# Creates .apk or .aab file for Google Play
```

---

## Environment Variables

Create `.env` file:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8081/api/v1
REACT_APP_WS_URL=ws://localhost:8081/ws

# Feature Flags
ENABLE_BIOMETRIC=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_OFFLINE_MODE=true

# Logging
LOG_LEVEL=info
```

---

## Key Components

### Authentication Flow

**Login Screen → Redux Auth Slice → API Call → Token Storage**

```javascript
// screens/LoginScreen.js
const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  const handleLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store tokens
      await SecureStore.setItemAsync('accessToken', response.data.token);
      await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);
      
      // Update Redux
      dispatch(setUser(response.data.user));
      dispatch(setAuthenticated(true));
      
      // Navigate to main app
      navigation.replace('MainStack');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };
  
  return <LoginForm onSubmit={handleLogin} />;
};
```

### Redux Store Structure

```javascript
// store/slices/authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  }
});
```

### Real-Time WebSocket Integration

```javascript
// services/websocket.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = {};
  }
  
  connect(token) {
    this.ws = new WebSocket(
      `${process.env.REACT_APP_WS_URL}?token=${token}`
    );
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this._dispatch(data.type, data.payload);
    };
  }
  
  subscribe(channel) {
    this.ws.send(JSON.stringify({
      action: 'subscribe',
      channel
    }));
  }
  
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }
  
  _dispatch(type, payload) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(cb => cb(payload));
    }
  }
}

export default new WebSocketService();
```

### Biometric Authentication

```javascript
// services/biometric.js
import * as LocalAuthentication from 'expo-local-authentication';

export async function setupBiometric() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  
  if (!compatible) {
    console.warn('Device does not support biometric auth');
    return false;
  }
  
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticate() {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      disableDeviceFallback: false,
      fallbackLabel: 'Use passcode'
    });
    
    return result.success;
  } catch (error) {
    console.error('Biometric auth error:', error);
    return false;
  }
}
```

### Push Notifications Setup

```javascript
// services/notifications.js
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  const token = await Notifications.getExpoPushTokenAsync();
  
  // Send token to backend
  await api.post('/users/push-token', { token });
  
  // Set up notification listener
  Notifications.addNotificationResponseListener(response => {
    const { data } = response.notification.request.content;
    handleNotificationData(data);
  });
}
```

### Offline-First Sync

```javascript
// services/storage.js
class StorageService {
  async saveMarketData(symbol, data) {
    const key = `market:${symbol}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
  
  async getMarketData(symbol) {
    const key = `market:${symbol}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  async syncPendingChanges() {
    const pending = await AsyncStorage.getItem('pending_changes');
    if (!pending) return;
    
    const changes = JSON.parse(pending);
    
    try {
      // Sync each change
      for (const change of changes) {
        await api.post('/sync', change);
      }
      
      // Clear pending
      await AsyncStorage.removeItem('pending_changes');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

### Multi-Language Support

```javascript
// store/slices/uiSlice.js
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    language: 'en',  // 'mr', 'hi', 'en', 'gu', 'kn'
    theme: 'light'   // 'light' or 'dark'
  },
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      // Load translations for language
      loadTranslations(action.payload);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    }
  }
});

// Custom hook for translations
export function useTranslations() {
  const language = useSelector(state => state.ui.language);
  const [translations, setTranslations] = useState({});
  
  useEffect(() => {
    // Load language-specific translations
    import(`./i18n/${language}.json`)
      .then(module => setTranslations(module.default));
  }, [language]);
  
  return translations;
}

// Usage in components
export function PriceCard({ symbol, price }) {
  const t = useTranslations();
  
  return (
    <View>
      <Text>{t.symbol}: {price}</Text>
    </View>
  );
}
```

---

## API Integration

### REST API Client

```javascript
// services/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Request interceptor - add JWT token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      try {
        const response = await api.post('/auth/refresh', {
          refresh_token: refreshToken
        });
        
        await SecureStore.setItemAsync('accessToken', response.data.token);
        
        // Retry original request
        return api(error.config);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        dispatch(logout());
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### API Calls

```javascript
// Usage in screens
const { data: prices } = await api.get('/market/prices', {
  params: { symbols: ['RELIANCE', 'INFY'] }
});

const signal = await api.post('/signals', {
  symbol: 'RELIANCE',
  entry_price: 2500,
  target_price: 2600
});
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Example Tests

```javascript
// __tests__/services.test.js
import { render, waitFor } from '@testing-library/react-native';
import { useAuth } from '../store/hooks';

describe('Auth Service', () => {
  it('should login user', async () => {
    const { result } = renderHook(() => useAuth());
    
    await result.current.login('test@example.com', 'password');
    
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

---

## Performance Optimization

### Memory Management
- ✅ Lazy load screens
- ✅ Memoize expensive components
- ✅ Clean up event listeners

### Bundle Size
- ✅ Tree-shake unused imports
- ✅ Lazy load libraries
- ✅ Use Code Splitting

### Network Optimization
- ✅ Compress API responses
- ✅ Cache market data locally
- ✅ Batch API requests
- ✅ Use WebSocket for real-time data

---

## Deployment

### iOS App Store

```bash
# Build for distribution
expo build:ios --release-channel production

# Submit to App Store
# Use Transporter app to upload .ipa file
```

### Google Play Store

```bash
# Build for Play Store
expo build:android --release-channel production --type aab

# Upload to Google Play Console
```

### Production Checklist

```
[ ] Environment variables configured
[ ] API endpoints verified
[ ] Biometric auth tested
[ ] Push notifications working
[ ] Offline mode tested
[ ] All 5 languages complete
[ ] Dark mode tested
[ ] Privacy policy updated
[ ] Terms of service finalized
[ ] App icon and splash screen optimized
```

---

## Troubleshooting

### Expo build fails

**Solution**: Clear cache and rebuild
```bash
expo build:ios --clear-cache
```

### API connection issues

**Solution**: Check network configuration
```javascript
// Add debug logging
console.log('API URL:', process.env.REACT_APP_API_URL);
```

### Biometric not working

**Solution**: Check device support
```javascript
const supported = await LocalAuthentication.hasHardwareAsync();
console.log('Biometric supported:', supported);
```

### Redux state not persisting

**Solution**: Ensure Redux Persist is configured
```javascript
import { persistStore } from 'redux-persist';

persistStore(store);
```

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md).

**Mobile app-specific rules:**
1. ✅ Test on both iOS and Android
2. ✅ All 5 languages must be complete
3. ✅ Offline mode must work
4. ✅ Biometric auth tested
5. ✅ Performance: < 3s cold start

---

## Support

For mobile app issues:
- 📱 Test with Expo Go for instant preview
- 🐛 File issues with "mobile:" prefix
- 📊 Check React DevTools for Redux state

---

**Built with ❤️ for mobile traders**
