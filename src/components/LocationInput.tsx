import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader, Navigation } from 'lucide-react';
import { initializeGoogleMaps, getCurrentLocation, reverseGeocode, geocodeAddress } from '../services/locationService';

interface LocationInputProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your city or zip code",
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await initializeGoogleMaps();
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteService.current = new google.maps.places.AutocompleteService();
          setIsGoogleMapsLoaded(true);
        }
      } catch (error) {
        console.warn('Google Maps failed to load:', error);
      }
    };

    loadGoogleMaps();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 2 && autocompleteService.current) {
      const request = {
        input: inputValue,
        types: ['(cities)'],
        componentRestrictions: { country: 'us' }
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: google.maps.places.AutocompletePrediction) => {
    const location = suggestion.description;
    onChange(location);
    setShowSuggestions(false);

    // Get coordinates for the selected location
    try {
      const coordinates = await geocodeAddress(location);
      if (coordinates) {
        onChange(location, {
          lat: coordinates.lat(),
          lng: coordinates.lng()
        });
      }
    } catch (error) {
      console.warn('Failed to get coordinates for location:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      const address = await reverseGeocode(latitude, longitude);
      if (address) {
        onChange(address, { lat: latitude, lng: longitude });
      } else {
        onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { lat: latitude, lng: longitude });
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Unable to get your current location. Please enter your location manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const isDarkTheme = className?.includes('dark');

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkTheme ? 'text-white/40' : 'text-gray-400'}`} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-3 ${isDarkTheme 
            ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400' 
            : 'border border-gray-300 focus:ring-2 focus:ring-electric-blue focus:border-transparent'
          } rounded-lg focus:outline-none ${className}`}
        />
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${isDarkTheme 
            ? 'text-white/40 hover:text-white' 
            : 'text-gray-400 hover:text-electric-blue'
          } transition-colors`}
          title="Use current location"
        >
          {isLoading ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Navigation className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute z-10 w-full mt-1 ${isDarkTheme 
          ? 'bg-gray-900 border border-white/20' 
          : 'bg-white border border-gray-300'
        } rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left ${isDarkTheme
                ? 'hover:bg-white/10 focus:bg-white/10 border-b border-white/10'
                : 'hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100'
              } focus:outline-none last:border-b-0`}
            >
              <div className="flex items-center">
                <MapPin className={`h-4 w-4 ${isDarkTheme ? 'text-white/40' : 'text-gray-400'} mr-3 flex-shrink-0`} />
                <div>
                  <div className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className={`text-sm ${isDarkTheme ? 'text-white/60' : 'text-gray-600'}`}>
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!isGoogleMapsLoaded && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <div className="flex items-center">
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Loading location services...
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput;