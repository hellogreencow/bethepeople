import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let googleMapsLoader: Loader | null = null;
let isLoaded = false;

// Initialize Google Maps API
export const initializeGoogleMaps = async (): Promise<void> => {
  if (isLoaded) return;

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found. Location features will be limited.');
    return;
  }

  try {
    googleMapsLoader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    await googleMapsLoader.load();
    isLoaded = true;
  } catch (error) {
    console.error('Failed to load Google Maps API:', error);
  }
};

// Get user's current location
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Geocode address to coordinates
export const geocodeAddress = async (address: string): Promise<google.maps.LatLng | null> => {
  if (!isLoaded || !window.google) {
    console.warn('Google Maps not loaded');
    return null;
  }

  try {
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          console.warn('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  if (!isLoaded || !window.google) {
    console.warn('Google Maps not loaded');
    return null;
  }

  try {
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(lat, lng);
    
    return new Promise((resolve) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          // Get the most relevant address component (city, state)
          const addressComponents = results[0].address_components;
          const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name;
          const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name;
          
          if (city && state) {
            resolve(`${city}, ${state}`);
          } else {
            resolve(results[0].formatted_address);
          }
        } else {
          console.warn('Reverse geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Calculate distance between two points
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  if (!isLoaded || !window.google) {
    // Fallback to Haversine formula
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const point1 = new google.maps.LatLng(lat1, lng1);
  const point2 = new google.maps.LatLng(lat2, lng2);
  
  return google.maps.geometry.spherical.computeDistanceBetween(point1, point2) * 0.000621371; // Convert meters to miles
};

// Search for places using Google Places API
export const searchPlaces = async (query: string, location?: { lat: number; lng: number }): Promise<google.maps.places.PlaceResult[]> => {
  if (!isLoaded || !window.google) {
    console.warn('Google Maps not loaded');
    return [];
  }

  try {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    const request: google.maps.places.TextSearchRequest = {
      query,
      ...(location && {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 50000 // 50km radius
      })
    };

    return new Promise((resolve) => {
      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          console.warn('Places search failed:', status);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error('Places search error:', error);
    return [];
  }
};

// Get place details
export const getPlaceDetails = async (placeId: string): Promise<google.maps.places.PlaceResult | null> => {
  if (!isLoaded || !window.google) {
    console.warn('Google Maps not loaded');
    return null;
  }

  try {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId,
      fields: ['name', 'formatted_address', 'geometry', 'place_id', 'types']
    };

    return new Promise((resolve) => {
      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          console.warn('Place details failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};

// Search for volunteer organizations and nonprofits
export const searchVolunteerOrganizations = async (
  location: { lat: number; lng: number },
  radius: number = 40233 // 25 miles default in meters
): Promise<google.maps.places.PlaceResult[]> => {
  if (!isLoaded || !window.google) {
    console.error('Google Maps not loaded for organization search');
    return [];
  }

  console.log('Searching for organizations near:', location, 'within', Math.round(radius * 0.000621371), 'miles');

  try {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    const searchQueries = [
      'nonprofit organization',
      'volunteer opportunities',
      'animal shelter',
      'food bank',
      'community center',
      'charity organization',
      'soup kitchen',
      'homeless shelter',
      'environmental organization',
      'youth center',
      'senior center',
      'library volunteer',
      'hospital volunteer',
      'red cross',
      'habitat for humanity',
      'united way'
    ];

    const allResults: google.maps.places.PlaceResult[] = [];

    for (const query of searchQueries) {
      console.log('Searching for:', query);
      
      const request: google.maps.places.TextSearchRequest = {
        query,
        location: new google.maps.LatLng(location.lat, location.lng),
        radius
      };

      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
        service.textSearch(request, (results, status) => {
          console.log(`Search "${query}" status:`, status, 'results:', results?.length || 0);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results.slice(0, 5)); // Limit to 5 results per query
          } else {
            console.warn(`Search failed for "${query}":`, status);
            resolve([]);
          }
        });
      });

      allResults.push(...results);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Total organizations found:', allResults.length);

    // Remove duplicates based on place_id
    const uniqueResults = allResults.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    );

    console.log('Unique organizations after deduplication:', uniqueResults.length);
    return uniqueResults.slice(0, 15); // Limit total results
  } catch (error) {
    console.error('Organization search error:', error);
    return [];
  }
};

// Get detailed information about a place
export const getOrganizationDetails = async (placeId: string): Promise<google.maps.places.PlaceResult | null> => {
  if (!isLoaded || !window.google) {
    console.warn('Google Maps not loaded');
    return null;
  }

  try {
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId,
      fields: [
        'name', 
        'formatted_address', 
        'geometry', 
        'place_id', 
        'types',
        'formatted_phone_number',
        'website',
        'rating',
        'user_ratings_total',
        'photos',
        'opening_hours'
      ]
    };

    return new Promise((resolve) => {
      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          console.warn('Place details failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};