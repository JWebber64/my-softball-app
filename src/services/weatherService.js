const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';

// Add timeout to prevent infinite loading
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Make sure the export is correct
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
      
      // Use the provided coordinates directly
      const coordinates = {
        latitude: location.lat,
        longitude: location.lng
      };
      
      // Build the URL with the correct parameters for Open-Meteo
      const url = new URL(`${WEATHER_API_BASE}/forecast`);
      url.searchParams.append('latitude', coordinates.latitude);
      url.searchParams.append('longitude', coordinates.longitude);
      url.searchParams.append('daily', 'temperature_2m_max,precipitation_probability_max,windspeed_10m_max');
      url.searchParams.append('current_weather', 'true');
      url.searchParams.append('timezone', 'auto');
      url.searchParams.append('start_date', formattedDate);
      url.searchParams.append('end_date', formattedDate);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Weather service request failed');
      }

      const data = await response.json();
      
      return {
        temperature: data.current_weather.temperature,
        windSpeed: data.current_weather.windspeed,
        conditions: getWeatherCondition(data.current_weather.weathercode),
        precipitation: data.daily.precipitation_probability_max[0]
      };
    } catch (error) {
      console.error('Weather service error:', error);
      throw new Error('Failed to fetch weather data');
    }
  },
  
  async getCurrentWeather(location) {
    if (!location || !location.lat || !location.lng) {
      console.error('Invalid location data:', location);
      throw new Error('Valid location coordinates are required');
    }
    
    try {
      console.log('Getting current weather for location:', location);
      
      // Build the URL with the correct parameters for Open-Meteo
      const url = new URL(`${WEATHER_API_BASE}/forecast`);
      url.searchParams.append('latitude', location.lat);
      url.searchParams.append('longitude', location.lng);
      url.searchParams.append('current_weather', 'true');
      url.searchParams.append('daily', 'precipitation_probability_max');
      url.searchParams.append('timezone', 'auto');
      
      console.log('Weather API URL:', url.toString());
      
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        throw new Error('Weather service request failed');
      }

      const data = await response.json();
      console.log('Weather API response:', data);
      
      return {
        temperature: data.current_weather.temperature,
        windSpeed: data.current_weather.windspeed,
        conditions: getWeatherCondition(data.current_weather.weathercode),
        precipitation: data.daily.precipitation_probability_max[0]
      };
    } catch (error) {
      console.error('Weather service error:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
};

// Helper function to convert weather codes to human-readable conditions
function getWeatherCondition(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    95: 'Thunderstorm'
  };
  
  return weatherCodes[code] || 'Unknown';
}





