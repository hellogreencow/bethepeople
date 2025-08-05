# Be The People Mobile App

Native mobile application for the volunteer matching platform built with Expo and React Native.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone (for testing)

### Development Setup

1. **Navigate to mobile app directory:**
   ```bash
   cd bethepeopleapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   expo start
   ```

4. **Test on device:**
   - Install Expo Go on your phone
   - Scan the QR code from terminal
   - Or run on iOS/Android simulator

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run as web app (for testing)

## 📱 Features

- **Native Swipe Interface** - Smooth gesture-based opportunity browsing
- **Touch Optimized** - Designed specifically for mobile interaction
- **Offline Support** - Works with cached data
- **Push Notifications** - Get notified about new opportunities
- **Camera Integration** - Upload photos and profiles
- **GPS Location** - Find nearby volunteer opportunities

## 🛠 Development

### Project Structure
```
bethepeopleapp/
├── App.tsx              # Main app component
├── src/
│   ├── components/      # Reusable components
│   ├── screens/         # App screens
│   ├── services/        # API and data services
│   └── utils/           # Helper functions
├── assets/              # Images, icons, fonts
└── app.config.js        # Expo configuration
```

### Key Components
- **SwipeCard** - Individual opportunity cards with swipe gestures
- **SwipeInterface** - Main swiping interface
- **Navigation** - Bottom tab navigation
- **Profile** - User profile and settings

### API Integration
The mobile app connects to the web application's API:
- Base URL: `https://sparkit.space`
- Real-time opportunity sync
- User authentication
- Profile management

## 📦 Building for Production

### Android (APK)
```bash
expo build:android
```

### iOS (IPA)
```bash
expo build:ios
```

### App Store Deployment
```bash
expo submit:android
expo submit:ios
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `EXPO_PUBLIC_API_BASE_URL` - Backend API URL
- `EXPO_PUBLIC_DEV_MODE` - Development mode toggle

### App Configuration
Edit `app.config.js` for:
- App name and description
- Bundle identifiers
- App icons and splash screens
- Platform-specific settings

## 📋 TODO

- [ ] Implement user authentication
- [ ] Add push notifications
- [ ] Integrate camera functionality
- [ ] Add offline data sync
- [ ] Implement deep linking
- [ ] Add app analytics
- [ ] Create onboarding flow
- [ ] Add accessibility features

## 🐛 Troubleshooting

**Metro bundler issues:**
```bash
expo start --clear
```

**Dependency issues:**
```bash
rm -rf node_modules && npm install
```

**Simulator not working:**
```bash
expo install --fix
```

## 📞 Support

For mobile-specific issues:
1. Check Expo documentation
2. Verify device compatibility
3. Test on multiple devices
4. Check console logs in Expo Go