# Be The People

A modern volunteer matching platform that connects people with meaningful local opportunities based on their interests, availability, and location.

## 🌐 Multi-Platform Architecture

This project consists of two connected but separate experiences:

### **Web Application** (Main Directory)
- Full-featured desktop/web experience
- Complete volunteer matching platform
- Advanced filtering and search
- AI chat assistant
- Swipeable interface optimized for web

### **Mobile Application** (`/BeThePeopleApp`)
- Native mobile experience built with Expo
- Touch-optimized swipe interface
- GPS location services
- Push notifications
- Camera integration
- Offline support
- Future: App Store deployment

## Features

- **Smart Matching**: Personalized volunteer opportunities based on user preferences
- **Location-Based Search**: Find opportunities near you using Google Places API
- **Real-Time Distance Calculation**: See how far opportunities are from your location
- **Comprehensive Filtering**: Filter by type, frequency, category, and distance
- **Impact Tracking**: Track volunteer hours, badges, and community impact
- **Responsive Design**: Optimized for all devices

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Google Maps API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Create an API key
   - Copy `.env.example` to `.env` and add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. Start the development server:
```bash
npm run dev
```

## Mobile Development (Expo)

1. Navigate to mobile app:
```bash
cd BeThePeopleApp
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo development server:
```bash
npm start
```

4. Test on device:
- Install Expo Go app on your phone
- Scan QR code from terminal
- Or run on iOS/Android simulator

## Google Maps API Setup

To enable location features, you'll need to:

1. **Create a Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Required APIs**
   - Maps JavaScript API (for map functionality)
   - Places API (for location autocomplete)
   - Geocoding API (for address to coordinates conversion)

3. **Create API Key**
   - Go to "Credentials" in the Google Cloud Console
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Replace `your_google_maps_api_key_here` with your actual API key

5. **Set API Restrictions (Recommended)**
   - In the Google Cloud Console, edit your API key
   - Add HTTP referrer restrictions for security
   - Restrict to only the APIs you're using

## Location Features

With Google Maps API configured, users can:

- **Auto-complete locations** during onboarding
- **Use current location** with GPS
- **See distance** to volunteer opportunities
- **Filter by distance** from their location
- **Get accurate geocoding** for addresses

## Environment Variables

- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key for location services
- `VITE_OPENROUTER_API_KEY`: Your OpenRouter API key for AI-generated volunteer opportunities
- `VITE_FIRECRAWL_API_KEY`: Your Firecrawl API key (optional, for web scraping)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **Maps**: Google Maps JavaScript API
- **AI**: OpenRouter with Perplexity for intelligent opportunity generation
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # React components
├── context/            # React context providers
├── data/              # Mock data and types
├── services/          # API services and utilities
└── main.tsx          # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details