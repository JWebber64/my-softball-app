import { Box, HStack, Icon, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { WiCloudy, WiDayCloudyHigh, WiDayFog, WiDaySunny, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';

const getWeatherIcon = (conditions) => {
  const iconMap = {
    'Clear sky': WiDaySunny,
    'Mainly clear': WiDaySunny,
    'Partly cloudy': WiDayCloudyHigh,
    'Overcast': WiCloudy,
    'Foggy': WiDayFog,
    'Depositing rime fog': WiDayFog,
    'Light drizzle': WiRain,
    'Moderate drizzle': WiRain,
    'Dense drizzle': WiRain,
    'Slight rain': WiRain,
    'Moderate rain': WiRain,
    'Heavy rain': WiRain,
    'Slight snow': WiSnow,
    'Moderate snow': WiSnow,
    'Heavy snow': WiSnow,
    'Thunderstorm': WiThunderstorm,
  };

  return iconMap[conditions] || WiDaySunny;
};

// Add color mapping for weather icons
const getWeatherIconColor = (conditions) => {
  const colorMap = {
    'Clear sky': '#FFD700', // Gold
    'Mainly clear': '#FFD700', // Gold
    'Partly cloudy': '#87CEEB', // Sky Blue
    'Overcast': '#708090', // Slate Gray
    'Foggy': '#B0C4DE', // Light Steel Blue
    'Depositing rime fog': '#B0C4DE', // Light Steel Blue
    'Light drizzle': '#4682B4', // Steel Blue
    'Moderate drizzle': '#4682B4', // Steel Blue
    'Dense drizzle': '#4682B4', // Steel Blue
    'Slight rain': '#4682B4', // Steel Blue
    'Moderate rain': '#4169E1', // Royal Blue
    'Heavy rain': '#000080', // Navy
    'Slight snow': '#E0FFFF', // Light Cyan
    'Moderate snow': '#E0FFFF', // Light Cyan
    'Heavy snow': '#FFFFFF', // White
    'Thunderstorm': '#9932CC', // Dark Orchid
  };

  return colorMap[conditions] || '#FFD700'; // Default to gold
};

const WeatherInfo = ({ weather }) => (
  <VStack align="center" spacing={4} width="100%">
    <HStack spacing={4} width="100%" justifyContent="center">
      <Icon 
        as={getWeatherIcon(weather?.conditions)} 
        boxSize={16} 
        color={getWeatherIconColor(weather?.conditions)}
      />
      <VStack align="start" spacing={0}>
        <Text fontSize="4xl" fontWeight="bold" lineHeight="1">
          {weather?.temperature}°
        </Text>
        <Text fontSize="lg" color="brand.text.secondary">
          {weather?.conditions}
        </Text>
      </VStack>
    </HStack>
    <HStack spacing={6} width="100%" pt={2} justifyContent="center">
      <VStack align="center" spacing={1}>
        <Text color="brand.text.secondary" fontSize="sm">Wind</Text>
        <Text fontWeight="medium">{weather?.windSpeed} km/h</Text>
      </VStack>
      <VStack align="center" spacing={1}>
        <Text color="brand.text.secondary" fontSize="sm">Precipitation</Text>
        <Text fontWeight="medium">{weather?.precipitation}%</Text>
      </VStack>
    </HStack>
  </VStack>
);

const WeatherDisplay = ({ 
  currentWeather, 
  nextGameWeather, 
  nextGameDate, 
  nextGameOpponent,
  location, 
  isLoading 
}) => {
  // Enhanced debug logging
  console.log('WeatherDisplay props:', { 
    currentWeather, 
    nextGameWeather, 
    nextGameDate,
    nextGameOpponent,
    location, 
    isLoading 
  });
  
  // Track active tab index
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // If loading, show spinner
  if (isLoading) {
    return (
      <Box 
        bg="brand.primary.base" 
        p={6} 
        borderRadius="lg"
        boxShadow="sm"
        textAlign="center"
        width="100%"
        maxWidth="400px"
        height="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.accent.base" />
          <Text>Loading weather for {location || 'this location'}...</Text>
        </VStack>
      </Box>
    );
  }
  
  // If no weather data is provided, show placeholder
  if (!currentWeather) {
    return (
      <Box 
        bg="brand.primary.base" 
        p={6} 
        borderRadius="lg"
        boxShadow="sm"
        textAlign="center"
        width="100%"
        maxWidth="400px"
      >
        <Text>Weather data not available for {location || 'this location'}</Text>
        <Text fontSize="sm" mt={2}>Please update team location in team settings</Text>
      </Box>
    );
  }

  // Check if next game data is available
  const hasNextGameData = nextGameDate && nextGameOpponent;

  // Add this debugging code at the top of the component
  console.log('Next game data check:', {
    nextGameDate,
    nextGameOpponent,
    hasNextGameData: nextGameDate && nextGameOpponent,
    isDisabled: !nextGameDate || !nextGameOpponent
  });

  return (
    <Box 
      bg="brand.primary.base" 
      p={6} 
      borderRadius="lg"
      boxShadow="sm"
      width="100%"
      maxWidth="400px"
    >
      <Tabs 
        variant="soft-rounded" 
        colorScheme="brand" 
        isFitted
        align="center"
        defaultIndex={0}
        onChange={setActiveTabIndex}
      >
        <TabList mb={4} justifyContent="center">
          <Tab 
            _selected={{ 
              color: "white", 
              bg: "var(--content-gradient-middle)",
              fontWeight: "bold"
            }}
            _hover={{
              bg: "var(--app-gradient-middle)"
            }}
            bg={activeTabIndex === 0 ? "var(--content-gradient-middle)" : "transparent"}
            color={activeTabIndex === 0 ? "white" : "brand.text.primary"}
          >
            Current Weather
          </Tab>
          <Tab 
            isDisabled={false} // Force enable for testing
            _selected={{ 
              color: "white", 
              bg: "var(--button-primary)",
              fontWeight: "bold"
            }}
            _hover={{
              bg: "var(--button-primary-hover)"
            }}
            bg={activeTabIndex === 1 ? "var(--button-primary)" : "transparent"}
            color={activeTabIndex === 1 ? "white" : "brand.text.primary"}
          >
            Next Game
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <WeatherInfo weather={currentWeather} />
          </TabPanel>
          <TabPanel px={0}>
            {hasNextGameData && (
              <VStack align="center" spacing={4}>
                <Text 
                  fontSize="sm" 
                  color="brand.text.secondary"
                  fontWeight="medium"
                >
                  {nextGameDate ? new Date(nextGameDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Next Game'}
                </Text>
                {nextGameOpponent && (
                  <Text 
                    fontSize="sm" 
                    color="brand.text.secondary"
                    fontWeight="medium"
                  >
                    vs {nextGameOpponent}
                  </Text>
                )}
                <WeatherInfo weather={nextGameWeather || currentWeather} />
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

WeatherDisplay.propTypes = {
  currentWeather: PropTypes.shape({
    temperature: PropTypes.number,
    conditions: PropTypes.string,
    windSpeed: PropTypes.number,
    precipitation: PropTypes.number,
  }),
  nextGameWeather: PropTypes.shape({
    temperature: PropTypes.number,
    conditions: PropTypes.string,
    windSpeed: PropTypes.number,
    precipitation: PropTypes.number,
  }),
  nextGameDate: PropTypes.string,
  nextGameOpponent: PropTypes.string,
  location: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default WeatherDisplay;












