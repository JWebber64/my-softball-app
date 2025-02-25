const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';
const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

// Default coordinates for common locations
const DEFAULT_COORDINATES = {
  'New York, NY': { latitude: 40.7128, longitude: -74.0060 },
  'Los Angeles, CA': { latitude: 34.0522, longitude: -118.2437 },
  'Chicago, IL': { latitude: 41.8781, longitude: -87.6298 },
  'Houston, TX': { latitude: 29.7604, longitude: -95.3698 },
  'Phoenix, AZ': { latitude: 33.4484, longitude: -112.0740 },
  'Philadelphia, PA': { latitude: 39.9526, longitude: -75.1652 },
  'San Antonio, TX': { latitude: 29.4241, longitude: -98.4936 },
  'San Diego, CA': { latitude: 32.7157, longitude: -117.1611 },
  'Dallas, TX': { latitude: 32.7767, longitude: -96.7970 },
  'San Francisco, CA': { latitude: 37.7749, longitude: -122.4194 },
  'Boston, MA': { latitude: 42.3601, longitude: -71.0589 },
  'Seattle, WA': { latitude: 47.6062, longitude: -122.3321 },
  'Miami, FL': { latitude: 25.7617, longitude: -80.1918 },
  'Denver, CO': { latitude: 39.7392, longitude: -104.9903 },
  'Atlanta, GA': { latitude: 33.7490, longitude: -84.3880 }
};

// Default fallback coordinates (New York)
const FALLBACK_COORDINATES = { latitude: 40.7128, longitude: -74.0060 };

export const weatherService = {
  async getGameDayForecast(location, date) {
    if (!location) {
      throw new Error('Location is required');
    }
    
    if (!date) {
      throw new Error('Date is required');
    }
    
    try {
      console.log('Getting weather for location:', location, 'and date:', date);
      
      // Make sure the date is in the correct format (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      // Get coordinates from location string
      const coordinates = await getCoordinates(location);
      console.log('Geocoded coordinates:', coordinates);
      
      // Build the URL with the correct parameters for Open-Meteo
      const url = `${WEATHER_API_BASE}/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`;
      
      console.log(`Fetching weather from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Weather API error response:', errorText);
        throw new Error(`Weather API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Weather API response:', data);
      
      // Get weather condition based on WMO weather code
      // https://open-meteo.com/en/docs/weather-forecast-api
      const weatherCode = data.daily.weathercode[0];
      const condition = getWeatherCondition(weatherCode);
      
      // Transform the Open-Meteo response to match our expected format
      return {
        temperature: Math.round((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2), // average temp
        condition: condition.text,
        humidity: 50, // Open-Meteo doesn't provide humidity in the free tier
        windSpeed: Math.round(data.daily.windspeed_10m_max[0]),
        icon: condition.icon
      };
    } catch (error) {
      console.error('Weather service error:', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }
};

// Function to get coordinates for a location
async function getCoordinates(locationString) {
  // Clean up the location string
  const cleanLocation = locationString.replace(/,\s*undefined/g, '').trim();
  
  // Check if we have default coordinates for this location
  if (DEFAULT_COORDINATES[cleanLocation]) {
    console.log(`Using default coordinates for ${cleanLocation}`);
    return DEFAULT_COORDINATES[cleanLocation];
  }
  
  // Try geocoding only if we have a valid API key
  if (OPENCAGE_API_KEY && OPENCAGE_API_KEY !== '56a86ba8c598928aaf30486299fc3b95') {
    try {
      console.log('Attempting to geocode with OpenCage API');
      return await geocodeLocation(cleanLocation);
    } catch (error) {
      console.warn('Geocoding failed, using fallback coordinates:', error);
      return FALLBACK_COORDINATES;
    }
  } else {
    console.warn('No valid OpenCage API key, using fallback coordinates');
    return FALLBACK_COORDINATES;
  }
}

// Helper function to geocode a location string to coordinates using OpenCage
async function geocodeLocation(locationString) {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationString)}&key=${OPENCAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return {
        latitude: data.results[0].geometry.lat,
        longitude: data.results[0].geometry.lng
      };
    } else {
      console.warn('No geocoding results found, using fallback coordinates');
      return FALLBACK_COORDINATES;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error; // Let the caller handle this
  }
}

// Helper function to convert WMO weather codes to readable conditions and icons
// Based on https://open-meteo.com/en/docs/weather-forecast-api
function getWeatherCondition(code) {
  // Map WMO codes to conditions and icons
  const conditions = {
    0: { text: "Clear sky", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" },
    1: { text: "Mainly clear", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" },
    2: { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" },
    3: { text: "Overcast", icon: "//cdn.weatherapi.com/weather/64x64/day/119.png" },
    45: { text: "Fog", icon: "//cdn.weatherapi.com/weather/64x64/day/143.png" },
    48: { text: "Depositing rime fog", icon: "//cdn.weatherapi.com/weather/64x64/day/143.png" },
    51: { text: "Light drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png" },
    53: { text: "Moderate drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png" },
    55: { text: "Dense drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png" },
    56: { text: "Light freezing drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/281.png" },
    57: { text: "Dense freezing drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/284.png" },
    61: { text: "Slight rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" },
    63: { text: "Moderate rain", icon: "//cdn.weatherapi.com/weather/64x64/day/302.png" },
    65: { text: "Heavy rain", icon: "//cdn.weatherapi.com/weather/64x64/day/308.png" },
    66: { text: "Light freezing rain", icon: "//cdn.weatherapi.com/weather/64x64/day/311.png" },
    67: { text: "Heavy freezing rain", icon: "//cdn.weatherapi.com/weather/64x64/day/314.png" },
    71: { text: "Slight snow fall", icon: "//cdn.weatherapi.com/weather/64x64/day/326.png" },
    73: { text: "Moderate snow fall", icon: "//cdn.weatherapi.com/weather/64x64/day/332.png" },
    75: { text: "Heavy snow fall", icon: "//cdn.weatherapi.com/weather/64x64/day/338.png" },
    77: { text: "Snow grains", icon: "//cdn.weatherapi.com/weather/64x64/day/326.png" },
    80: { text: "Slight rain showers", icon: "//cdn.weatherapi.com/weather/64x64/day/353.png" },
    81: { text: "Moderate rain showers", icon: "//cdn.weatherapi.com/weather/64x64/day/356.png" },
    82: { text: "Violent rain showers", icon: "//cdn.weatherapi.com/weather/64x64/day/359.png" },
    85: { text: "Slight snow showers", icon: "//cdn.weatherapi.com/weather/64x64/day/368.png" },
    86: { text: "Heavy snow showers", icon: "//cdn.weatherapi.com/weather/64x64/day/371.png" },
    95: { text: "Thunderstorm", icon: "//cdn.weatherapi.com/weather/64x64/day/389.png" },
    96: { text: "Thunderstorm with slight hail", icon: "//cdn.weatherapi.com/weather/64x64/day/392.png" },
    99: { text: "Thunderstorm with heavy hail", icon: "//cdn.weatherapi.com/weather/64x64/day/395.png" }
  };
  
  return conditions[code] || { text: "Unknown", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" };
}
