# Borla Wura Rider - React Native Mobile App

This is the React Native mobile application version of the Borla Wura Rider web application. All UI/UX features from the web version have been preserved and converted to work seamlessly on iOS and Android devices.

## Features

All features from the web application have been maintained:

- ✅ **Home Dashboard** - Online/Offline toggle, earnings summary, performance metrics, quick actions
- ✅ **Trip History** - Filterable trip list with search functionality and expandable trip details
- ✅ **Earnings** - Balance tracking, withdrawal to Mobile Money, transaction history with filters
- ✅ **Profile** - Edit profile, verification status, settings toggles, payment details management
- ✅ **Request Handling** - Countdown timer, map integration, accept/decline trip requests
- ✅ **Active Trip** - Progress tracking with step indicators, disposal site selection, customer contact
- ✅ **Trip Complete** - Earnings summary, trip details, navigation to earnings or home
- ✅ **Support** - Contact form, FAQs accordion, emergency contact information
- ✅ **Internationalization** - i18n support for multiple languages
- ✅ **Bottom Navigation** - Native tab navigation with icons and labels

## Tech Stack

- **React Native** with **Expo** (~51.0.0)
- **TypeScript** for type safety
- **React Navigation** for navigation (bottom tabs + stack)
- **React Native Maps** for map integration
- **React Native Vector Icons** (@expo/vector-icons) for icons
- **Expo Linear Gradient** for gradient backgrounds
- **i18next** for internationalization
- **React Native Reanimated** for smooth animations
- **React Native Gesture Handler** for gestures

## Project Structure

```
borlawura_Rider/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── babel.config.js           # Babel configuration
├── tsconfig.json             # TypeScript configuration
├── package-rn.json           # React Native dependencies (rename to package.json)
├── src/
│   ├── navigation/
│   │   └── index.tsx         # Navigation setup (tabs + stack)
│   ├── pages/
│   │   ├── home/             # Home dashboard
│   │   ├── trips/            # Trip history
│   │   ├── earnings/         # Earnings and withdrawals
│   │   ├── profile/          # User profile
│   │   ├── request/          # Trip request handling
│   │   ├── active-trip/      # Active trip management
│   │   ├── trip-complete/    # Trip completion screen
│   │   ├── support/          # Support and help
│   │   └── NotFound.tsx      # 404 page
│   ├── components/
│   │   └── common/
│   │       ├── Modal.tsx     # Custom modal component
│   │       ├── BottomModal.tsx # Bottom sheet modal
│   │       └── Toast.tsx     # Toast notification component
│   ├── utils/
│   │   ├── colors.ts         # Color constants
│   │   └── styles.ts         # Common styles
│   ├── i18n/
│   │   ├── index.ts          # i18n configuration
│   │   └── local/
│   │       └── index.ts      # Translation resources
│   └── mocks/
│       └── rider.ts          # Mock data
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. **Install dependencies:**
   ```bash
   # Rename package-rn.json to package.json or use it directly
   npm install
   # or
   yarn install
   ```

2. **Start the development server:**
   ```bash
   npm start
   # or
   expo start
   ```

3. **Run on device/simulator:**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal (limited functionality)

## Key Conversions from Web to Mobile

### Components
- `div` → `View`
- `button` → `TouchableOpacity`
- `input` → `TextInput`
- `img` → `Image`
- `a` → `Linking.openURL()` or `TouchableOpacity`

### Styling
- Tailwind CSS classes → React Native `StyleSheet`
- CSS animations → React Native Reanimated
- CSS gradients → Expo Linear Gradient

### Navigation
- React Router (`BrowserRouter`, `Routes`) → React Navigation (`NavigationContainer`, `Tab.Navigator`, `Stack.Navigator`)
- `useNavigate()`, `useLocation()` → React Navigation hooks (`useNavigation()`, `useRoute()`)

### Icons
- RemixIcon (`ri-*`) → Ionicons from `@expo/vector-icons`

### Maps
- Google Maps iframe → React Native Maps (`react-native-maps`)

### Phone/SMS
- `window.location.href = 'tel:...'` → `Linking.openURL('tel:...')`
- `window.location.href = 'sms:...'` → `Linking.openURL('sms:...')`

### Modals
- HTML modal with backdrop → React Native `Modal` component with custom styling

## Platform-Specific Notes

### iOS
- Safe area handling is managed automatically with `SafeAreaView`
- Status bar styling configured per screen

### Android
- Status bar styling may need adjustments based on Android version
- Back button navigation handled by React Navigation

## Configuration

### Maps API
Update the maps API key in `src/pages/request/index.tsx` if you need Google Maps integration. Currently uses React Native Maps which doesn't require an API key for basic functionality.

### Firebase/Supabase
The web version uses Firebase and Supabase. You'll need to configure these in the React Native app if you want backend integration:
- Install: `expo install firebase @supabase/supabase-js`
- Configure credentials in a separate config file

### i18n
Add translations in `src/i18n/local/index.ts` for additional languages.

## Building for Production

### iOS
```bash
expo build:ios
# or use EAS Build
eas build --platform ios
```

### Android
```bash
expo build:android
# or use EAS Build
eas build --platform android
```

## Troubleshooting

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Native module errors**: Run `expo install --fix`
3. **Navigation errors**: Ensure all screens are properly registered in navigation config
4. **Map not showing**: Check location permissions in `app.json`

## Notes

- All UI/UX features from the web version have been preserved
- The app uses the same color scheme and design patterns as the web version
- Bottom navigation replaces the web version's bottom nav bar
- Modals use native React Native Modal component for better mobile experience
- Toast notifications use custom component for consistent UX
- All animations and transitions are maintained using React Native Reanimated

## Future Enhancements

- Push notifications for trip requests
- Real-time location tracking
- Offline mode support
- Biometric authentication
- Dark mode support







