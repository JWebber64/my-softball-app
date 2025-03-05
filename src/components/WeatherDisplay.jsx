import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Flex, Icon, Spinner, VStack, HStack, Badge, Divider } from '@chakra-ui/react';
import { FaTemperatureHigh, FaWind, FaTint, FaExclamationTriangle, FaCloudSun, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { weatherService } from '../services/weatherService';

// Default fallback weather data if none is provided
const DEFAULT_FALLBACK_WEATHER = {
  temperature: 22,
  condition: "Partly Cloudy",
  humidity: 45,
  windSpeed: 13,
  icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
};

const WeatherDisplay = ({ 
  date = new Date(), 
  location = '', // Remove default New York value
  showDetails = true,
  onError,
  fallbackData = DEFAULT_FALLBACK_WEATHER
}) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiKeyIssue, setApiKeyIssue] = useState(false);

  useEffect(() => {
    let isMounted = true; // For cleanup

    const fetchWeatherData = async () => {
      if (!location) {
        setError('Location is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching weather for:', location); // Debug log

        const weatherData = await weatherService.getGameDayForecast(
          location.trim(),
          new Date(date).toISOString().split('T')[0]
        );
        
        console.log('Received weather data:', weatherData); // Debug log

        if (!isMounted) return;

        // Convert temperature from Fahrenheit to Celsius
        const celsiusTemp = Math.round((weatherData.temperature - 32) * 5 / 9);
        // Convert wind speed from mph to km/h
        const kmhWindSpeed = Math.round(weatherData.windSpeed * 1.60934);
        
        const processedWeather = {
          ...weatherData,
          temperature: celsiusTemp,
          windSpeed: kmhWindSpeed
        };

        console.log('Processed weather data:', processedWeather); // Debug log
        
        setWeather(processedWeather);
        setError(null);
        setApiKeyIssue(false);
      } catch (err) {
        console.error('Weather fetch error:', err);
        if (!isMounted) return;

        setError(err.message || 'Failed to load weather data');
        
        // Check if the error is related to API key
        if (err.message.includes('API key') || 
            err.message.includes('403') || 
            err.message.includes('disabled')) {
          setApiKeyIssue(true);
        }
        
        // Use fallback data if provided
        if (fallbackData) {
          console.log('Using fallback data:', fallbackData); // Debug log
          setWeather(fallbackData);
        }
        
        if (onError) {
          onError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeatherData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [location, date, onError, fallbackData]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100px" w="100%">
        <Spinner size="md" color="blue.500" />
      </Flex>
    );
  }

  if (error && !weather) {
    return (
      <Box p={3} bg="red.50" borderRadius="md" w="100%" h="auto">
        <Text color="red.500" fontSize="sm">{error}</Text>
      </Box>
    );
  }

  if (!weather) {
    return (
      <Box p={3} bg="gray.50" borderRadius="md" w="100%" h="auto">
        <Text fontSize="sm">No weather data available</Text>
      </Box>
    );
  }

  // Get weather condition class for background gradient
  const getWeatherGradient = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return 'linear-gradient(135deg, #4a5340 0%, #6b7a5c 100%)';
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      return 'linear-gradient(135deg, #3d4536 0%, #5a6550 100%)';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'linear-gradient(135deg, #364130 0%, #4d5a43 100%)';
    } else if (conditionLower.includes('snow') || conditionLower.includes('ice')) {
      return 'linear-gradient(135deg, #414b37 0%, #5f6b54 100%)';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return 'linear-gradient(135deg, #333c2a 0%, #4a5340 100%)';
    } else {
      return 'linear-gradient(135deg, #4a5340 0%, #6b7a5c 100%)';
    }
  };

  return (
    <Box 
      w="100%" 
      h="auto" 
      p={showDetails ? 4 : 2} 
      borderRadius="lg" 
      color="#EFF7EC"
      boxShadow="0 4px 12px rgba(0,0,0,0.15)"
      background={getWeatherGradient(weather.condition)}
      position="relative"
      overflow="hidden"
    >
      <VStack spacing={showDetails ? 3 : 1} align="stretch" position="relative">
        {/* Header with Location and Date */}
        {showDetails && (
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <Icon as={FaMapMarkerAlt} color="#c0fad0" mr={1} boxSize="0.8em" />
              <Text fontSize="md" fontWeight="bold" isTruncated>
                {location}
              </Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaCalendarAlt} color="#c0fad0" mr={1} boxSize="0.8em" />
              <Text fontSize="xs">
                {new Date(date).toLocaleDateString()}
              </Text>
            </Flex>
          </Flex>
        )}

        {/* Compact View */}
        {!showDetails && (
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              {weather.icon ? (
                <img 
                  src={weather.icon.startsWith('//') ? `https:${weather.icon}` : weather.icon} 
                  alt={weather.condition} 
                  width="32" 
                  height="32"
                />
              ) : (
                <Icon as={FaCloudSun} boxSize="2rem" color="#c0fad0" />
              )}
              <Text fontSize="sm">{Math.round(weather.temperature)}°</Text>
            </HStack>
            <Text fontSize="sm" isTruncated maxW="60%">
              {weather.condition}
            </Text>
          </Flex>
        )}

        {/* Error Notice */}
        {error && (
          <Badge 
            colorScheme="yellow" 
            variant="solid" 
            borderRadius="full" 
            px={2} 
            py={1} 
            fontSize="xs"
            display="flex" 
            alignItems="center"
            width="fit-content"
          >
            <Icon as={FaExclamationTriangle} mr={1} boxSize="0.8em" />
            {apiKeyIssue ? "Using estimated data" : "Using fallback data"}
          </Badge>
        )}

        <Divider borderColor="rgba(239, 247, 236, 0.2)" />

        {/* Main Weather Display */}
        {showDetails && (
          <Flex align="center" justify="space-between" py={2}>
            {/* Left: Icon and Condition */}
            <Flex align="center">
              {weather.icon ? (
                <img 
                  src={weather.icon.startsWith('//') ? `https:${weather.icon}` : weather.icon} 
                  alt={weather.condition || "Weather"} 
                  width="64" 
                  height="64" 
                  style={{ marginRight: '12px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    // Show fallback icon
                    const iconContainer = e.target.parentNode;
                    if (iconContainer) {
                      const fallbackIcon = document.createElement('div');
                      fallbackIcon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 18.364L17.657 17.657M6.343 6.343L5.636 5.636M18.364 5.636L17.657 6.343M6.343 17.657L5.636 18.364M16 12C16 14.209 14.209 16 12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12Z" stroke="#EFF7EC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                      iconContainer.appendChild(fallbackIcon);
                    }
                  }}
                />
              ) : (
                <Icon as={FaCloudSun} boxSize="3rem" color="#c0fad0" mr={3} />
              )}
              <Text fontSize="md" fontWeight="medium">
                {weather.condition || "Unknown"}
              </Text>
            </Flex>
            
            {/* Right: Temperature */}
            <Text fontSize="3xl" fontWeight="bold">
              {Math.round(weather.temperature)}°C
            </Text>
          </Flex>
        )}

        {/* Details Section */}
        {showDetails && (
          <Box 
            mt={2} 
            p={3} 
            borderRadius="md" 
            bg="rgba(0,0,0,0.1)"
          >
            <HStack spacing={6} justify="space-around" fontSize="sm">
              <Flex direction="column" align="center">
                <Icon as={FaTint} color="#c0fad0" boxSize="1.2em" mb={1} />
                <Text fontWeight="bold">{weather.humidity || 0}%</Text>
                <Text fontSize="xs" opacity="0.8">Humidity</Text>
              </Flex>
              <Flex direction="column" align="center">
                <Icon as={FaWind} color="#c0fad0" boxSize="1.2em" mb={1} />
                <Text fontWeight="bold">{weather.windSpeed || 0}</Text>
                <Text fontSize="xs" opacity="0.8">km/h</Text>
              </Flex>
              <Flex direction="column" align="center">
                <Icon as={FaTemperatureHigh} color="#c0fad0" boxSize="1.2em" mb={1} />
                <Text fontWeight="bold">{Math.round(weather.temperature)}°</Text>
                <Text fontSize="xs" opacity="0.8">Feels like</Text>
              </Flex>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

WeatherDisplay.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  location: PropTypes.string,
  showDetails: PropTypes.bool,
  onError: PropTypes.func,
  fallbackData: PropTypes.object
};

export default WeatherDisplay;
