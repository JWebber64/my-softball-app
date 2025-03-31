const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';

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
  }
};

// Helper function to convert weather codes to readable conditions
function getWeatherCondition(code) {
  const conditions = {
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
    95: 'Thunderstorm',
  };
  return conditions[code] || 'Unknown';
}
