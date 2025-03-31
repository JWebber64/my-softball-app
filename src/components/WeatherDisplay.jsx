import { Box, HStack, Icon, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
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

const WeatherInfo = ({ weather }) => (
  <VStack align="start" spacing={4}>
    <HStack spacing={4} width="100%">
      <Icon 
        as={getWeatherIcon(weather?.conditions)} 
        boxSize={16} 
        color="brand.accent.base"
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
    <HStack spacing={6} width="100%" pt={2}>
      <VStack align="start" spacing={1}>
        <Text color="brand.text.secondary" fontSize="sm">Wind</Text>
        <Text fontWeight="medium">{weather?.windSpeed} km/h</Text>
      </VStack>
      <VStack align="start" spacing={1}>
        <Text color="brand.text.secondary" fontSize="sm">Precipitation</Text>
        <Text fontWeight="medium">{weather?.precipitation}%</Text>
      </VStack>
    </HStack>
  </VStack>
);

const WeatherDisplay = ({ currentWeather, nextGameWeather, nextGameDate }) => {
  return (
    <Box 
      bg="brand.primary.base" 
      p={6} 
      borderRadius="lg"
      boxShadow="sm"
    >
      <Tabs variant="soft-rounded" colorScheme="brand.accent">
        <TabList mb={4}>
          <Tab>Current Weather</Tab>
          <Tab isDisabled={!nextGameWeather}>Next Game</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <WeatherInfo weather={currentWeather} />
          </TabPanel>
          <TabPanel px={0}>
            {nextGameWeather && (
              <VStack align="start" spacing={4}>
                <Text 
                  fontSize="sm" 
                  color="brand.text.secondary"
                  fontWeight="medium"
                >
                  {new Date(nextGameDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <WeatherInfo weather={nextGameWeather} />
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

WeatherInfo.propTypes = {
  weather: PropTypes.shape({
    temperature: PropTypes.number,
    conditions: PropTypes.string,
    windSpeed: PropTypes.number,
    precipitation: PropTypes.number
  })
};

WeatherDisplay.propTypes = {
  currentWeather: PropTypes.shape({
    temperature: PropTypes.number,
    conditions: PropTypes.string,
    windSpeed: PropTypes.number,
    precipitation: PropTypes.number
  }),
  nextGameWeather: PropTypes.shape({
    temperature: PropTypes.number,
    conditions: PropTypes.string,
    windSpeed: PropTypes.number,
    precipitation: PropTypes.number
  }),
  nextGameDate: PropTypes.string
};

export default WeatherDisplay;


