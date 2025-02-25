import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';
import { useTeamData } from '../hooks/useTeamData';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Icon,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Button,
  Image,
} from '@chakra-ui/react';
import { 
  FaInstagram, 
  FaFacebook, 
  FaYoutube, 
  FaTiktok, 
  FaTwitter, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaNewspaper, 
  FaSync, 
  FaCloud, 
  FaUser, 
  FaUsers,
  FaMedal,
  FaLink,
  FaExclamationTriangle,
  FaImage,
} from 'react-icons/fa';
import { supabase, checkSupabaseConnection } from '../lib/supabaseClient';
import WeatherDisplay from "../components/WeatherDisplay";
import BaseballCard from '../components/baseball-card/BaseballCard';

// SectionCard component definition
const SectionCard = ({ 
  title, 
  loading = false, 
  isEmpty = false, 
  error = null, 
  icon = null, 
  children = null, 
  onRefresh = null 
}) => (
  <Card 
    bg="brand.primary" 
    color="brand.text"
    position="absolute"
    top="0"
    left="0"
    right="0"
    bottom="0"
    display="flex"
    flexDirection="column"
  >
    <CardHeader py={4} px={6}>
      <HStack justify="space-between">
        <Heading size="md" display="flex" alignItems="center" gap={2} width="100%" justifyContent="center">
          {icon && <Icon as={icon} />}
          {title}
        </Heading>
        {loading && <Spinner size="sm" position="absolute" right="6" />}
      </HStack>
    </CardHeader>
    <CardBody 
      flex="1" 
      display="flex" 
      flexDirection="column" 
      p={6}
      overflow="hidden"
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex="1">
          <Spinner size="lg" />
        </Box>
      ) : error ? (
        <Box textAlign="center" display="flex" flexDirection="column" justifyContent="center" flex="1">
          <Text color="red.500" mb={2}>Error loading {title.toLowerCase()}</Text>
          {onRefresh && (
            <Button 
              size="sm" 
              onClick={onRefresh}
              leftIcon={<Icon as={FaSync} />}
            >
              Retry
            </Button>
          )}
        </Box>
      ) : isEmpty ? (
        <Box textAlign="center" display="flex" flexDirection="column" justifyContent="center" flex="1">
          <Text mb={2}>No {title.toLowerCase()} available</Text>
          {onRefresh && (
            <Button 
              size="sm" 
              onClick={onRefresh}
              leftIcon={<Icon as={FaSync} />}
            >
              Refresh
            </Button>
          )}
        </Box>
      ) : (
        <Box flex="1" overflow="hidden">
          {children}
        </Box>
      )}
    </CardBody>
  </Card>
);

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  isEmpty: PropTypes.bool,
  error: PropTypes.any,
  icon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  onRefresh: PropTypes.func
};

// Remove SectionCard.defaultProps as we're now using default parameters

// First, add a styled container for consistent card sizing
const CardContainer = ({ children }) => (
  <Box
    height="500px"
    width="100%"
    position="relative"
  >
    {children}
  </Box>
);

CardContainer.propTypes = {
  children: PropTypes.node.isRequired
};

// Add placeholder data
const PLACEHOLDER_WEATHER = {
  temperature: 75,
  condition: 'Sunny',
  humidity: 45,
  windSpeed: 8
};

const PLACEHOLDER_MEDIA = [
  {
    id: 1,
    type: 'video',
    title: 'Season Highlights',
    url: '#',
    thumbnail: '/placeholder-thumbnail.jpg'
  },
  {
    id: 2,
    type: 'image',
    title: 'Team Photo',
    url: '#',
    thumbnail: '/placeholder-image.jpg'
  }
];

const TeamInfoPage = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [playerStats, setPlayerStats] = useState({});
  const [currentLocation, setCurrentLocation] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [weatherError, setWeatherError] = useState(false);

  // Add useEffect to get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          // Check if API key is defined
          const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
          if (!apiKey) {
            console.error('OpenCage API key is not defined');
            setCurrentLocation('New York, NY'); // fallback location
            return;
          }
          
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=${apiKey}`
          );
          
          if (!response.ok) {
            throw new Error(`OpenCage API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const components = data.results[0].components;
            
            // Extract city and state with better fallbacks
            const city = components.city || 
                        components.town || 
                        components.village || 
                        components.county || 
                        components.state;
                        
            // Handle international locations that might not have state_code
            const state = components.state_code || 
                          components.state || 
                          components.country_code?.toUpperCase();
            
            if (city && state) {
              setCurrentLocation(`${city}, ${state}`);
            } else if (city) {
              setCurrentLocation(city);
            } else {
              // Use formatted address as last resort
              setCurrentLocation(data.results[0].formatted.split(',')[0]);
            }
            
            console.log('Location set to:', currentLocation);
          } else {
            throw new Error('No results found in geocoding response');
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setCurrentLocation('New York, NY'); // fallback location
        }
      }, () => {
        console.warn('Geolocation permission denied or unavailable');
        setCurrentLocation('New York, NY'); // fallback location on error
      });
    } else {
      console.warn('Geolocation not supported by browser');
      setCurrentLocation('New York, NY'); // fallback location if geolocation not available
    }
  }, []);

  // Add a useEffect that depends on currentLocation to see when it changes
  useEffect(() => {
    console.log('Location changed to:', currentLocation);
    // You could also reset weatherError here if needed
    if (currentLocation) {
      setWeatherError(false);
    }
  }, [currentLocation]);

  // News Section
  const { 
    data: newsData, 
    loading: newsLoading, 
    error: newsError, 
    refresh: newsRefresh 
  } = useTeamData('team_news');

  // Schedule Section
  const {
    data: scheduleData,
    loading: scheduleLoading,
    error: scheduleError,
    refresh: scheduleRefresh
  } = useTeamData('team_schedule');

  // Roster Section
  const {
    data: rosterData,
    loading: rosterLoading,
    error: rosterError,
    refresh: rosterRefresh
  } = useTeamData('team_roster');

  // Players of Week Section
  const {
    data: playersOfWeekData,
    loading: playersOfWeekLoading,
    error: playersOfWeekError,
    refresh: playersOfWeekRefresh
  } = useTeamData('players_of_week');

  // Social Media Section
  const {
    data: socialEmbedsData,
    loading: socialEmbedsLoading,
    error: socialEmbedsError,
    refresh: socialEmbedsRefresh
  } = useTeamData('social_media_embeds');

  // Media Embeds Section
  const mediaEmbedsData = PLACEHOLDER_MEDIA;

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    };
    checkConnection();
  }, []);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('*');
        if (error) throw error;
        
        const statsMap = {};
        data.forEach(stat => {
          statsMap[stat.player_id] = stat;
        });
        setPlayerStats(statsMap);
      } catch (error) {
        console.error('Error fetching player stats:', error);
      }
    };

    fetchPlayerStats();
  }, []);

  // Add this useEffect to handle weather errors
  useEffect(() => {
    const handleWeatherError = (err) => {
      console.error('Weather API error detected:', err);
      setWeatherError(true);
    };
    
    // Listen for weather errors
    window.addEventListener('weather-api-error', handleWeatherError);
    
    return () => {
      window.removeEventListener('weather-api-error', handleWeatherError);
    };
  }, []);

  // Add this function to your component
  const retryWeather = () => {
    console.log('Retrying weather with location:', currentLocation);
    setWeatherError(false);
    // Force a re-render by updating the date slightly
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Add this debugging code temporarily
  useEffect(() => {
    console.log('Environment check:');
    console.log('- NODE_ENV:', import.meta.env.MODE);
    console.log('- WEATHER_API_KEY defined:', !!import.meta.env.VITE_WEATHER_API_KEY);
    console.log('- OPENCAGE_API_KEY defined:', !!import.meta.env.VITE_OPENCAGE_API_KEY);
    // Don't log the actual keys for security reasons
  }, []);

  // Now we can have conditional returns
  if (connectionStatus === 'checking') {
    return (
      <Box p={8} maxW="1200px" mx="auto">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Connecting to server...</Text>
        </VStack>
      </Box>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <Box p={8} maxW="1200px" mx="auto">
        <VStack spacing={4}>
          <Icon as={FaExclamationTriangle} w={8} h={8} color="red.500" />
          <Text>Connection error. Please check your internet connection.</Text>
          <Button
            onClick={() => window.location.reload()}
            leftIcon={<Icon as={FaSync} />}
          >
            Retry Connection
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="1400px" mx="auto">
      <SimpleGrid 
        columns={{ base: 1, md: 2 }} 
        spacing={8}
        alignItems="stretch"
      >
        {/* Row 1 */}
        <CardContainer>
          <ErrorBoundary onRetry={newsRefresh}>
            <SectionCard 
              title="Team News" 
              loading={newsLoading}
              isEmpty={!newsData?.length}
              error={newsError}
              icon={FaNewspaper}
              onRefresh={newsRefresh}
            >
              <Box overflowY="auto" height="calc(100% - 2rem)">
                <VStack align="stretch" spacing={4}>
                  {newsData?.map((item) => (
                    <Box key={item.id}>
                      <Heading size="sm">{item.title}</Heading>
                      <Text noOfLines={3}>{item.content}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </SectionCard>
          </ErrorBoundary>
        </CardContainer>

        <CardContainer>
          <ErrorBoundary onRetry={scheduleRefresh}>
            <SectionCard
              title="Today's Schedule"
              loading={scheduleLoading}
              isEmpty={!scheduleData?.length}
              error={scheduleError}
              icon={FaCalendarAlt}
              onRefresh={scheduleRefresh}
            >
              <Box overflowY="auto" height="calc(100% - 2rem)">
                <VStack align="stretch" spacing={4}>
                  {scheduleData?.map((event) => (
                    <Box key={event.id}>
                      <Heading size="sm">{event.title}</Heading>
                      <Text>{event.description}</Text>
                      <HStack fontSize="sm" color="gray.500" spacing={4}>
                        <Text>{new Date(event.event_date).toLocaleTimeString()}</Text>
                        {event.location && (
                          <Text display="flex" alignItems="center">
                            <Icon as={FaMapMarkerAlt} mr={1} />
                            {event.location}
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </SectionCard>
          </ErrorBoundary>
        </CardContainer>

        <CardContainer>
          <ErrorBoundary onRetry={rosterRefresh}>
            <SectionCard
              title="Team Roster"
              loading={rosterLoading}
              isEmpty={!rosterData?.length}
              error={rosterError}
              icon={FaUsers}
              onRefresh={rosterRefresh}
            >
              <Box overflowY="auto" height="calc(100% - 2rem)">
                <VStack align="stretch" spacing={4}>
                  {rosterData?.map((player) => (
                    <Box 
                      key={player.id} 
                      p={3} 
                      borderRadius="md" 
                      bg="whiteAlpha.100"
                      _hover={{ bg: "whiteAlpha.200" }}
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Heading size="sm">{player.name}</Heading>
                          <Text>#{player.number} - {player.position}</Text>
                          {playerStats[player.id] && (
                            <Text fontSize="sm" color="gray.500">
                              AVG: {playerStats[player.id].avg} | HR: {playerStats[player.id].hr}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </SectionCard>
          </ErrorBoundary>
        </CardContainer>

        <CardContainer>
          <SectionCard 
            title="Weather Forecast" 
            icon={FaCloud}
            loading={!currentLocation} // Only show loading if location isn't set
            error={weatherError}
            onRefresh={() => setWeatherError(false)}
          >
            <ErrorBoundary fallback={<Text>Weather display error. Please try again later.</Text>}>
              <WeatherDisplay 
                location={currentLocation}
                date={currentDate}
                fallbackData={PLACEHOLDER_WEATHER}
                onError={(err) => {
                  console.error('Weather component error:', err);
                  setWeatherError(true);
                }}
              />
            </ErrorBoundary>
          </SectionCard>
        </CardContainer>

        {/* Row 2 */}
        <CardContainer>
          <ErrorBoundary onRetry={rosterRefresh}>
            <SectionCard
              title="Player Profiles"
              loading={rosterLoading}
              isEmpty={!rosterData?.length}
              error={rosterError}
              icon={FaUser}
              onRefresh={rosterRefresh}
            >
              <Box overflowY="auto" height="calc(100% - 2rem)">
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  {rosterData?.map((player) => (
                    <BaseballCard
                      key={player.id}
                      player={{
                        player_name: player.name,
                        jersey_number: player.number,
                        position: player.position,
                        photo_url: player.photoUrl,
                        stats: playerStats[player.id] || {}
                      }}
                    />
                  ))}
                </SimpleGrid>
              </Box>
            </SectionCard>
          </ErrorBoundary>
        </CardContainer>

        <CardContainer>
          <ErrorBoundary onRetry={playersOfWeekRefresh}>
            <SectionCard
              title="Players of the Week"
              loading={playersOfWeekLoading}
              isEmpty={!playersOfWeekData?.length}
              error={playersOfWeekError}
              icon={FaMedal}
              onRefresh={playersOfWeekRefresh}
            >
              <Box overflowY="auto" height="calc(100% - 2rem)">
                <VStack align="stretch" spacing={4}>
                  {playersOfWeekData?.map((player) => (
                    <Box key={player.id}>
                      <Heading size="sm">{player.name}</Heading>
                      <Text>{player.achievement}</Text>
                      <Text fontSize="sm" color="gray.500">
                        Week of {new Date(player.week_start).toLocaleDateString()}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </SectionCard>
          </ErrorBoundary>
        </CardContainer>

        <CardContainer>
          <ErrorBoundary onRetry={socialEmbedsRefresh}>
            <SectionCard
              title="Social Media"
              loading={socialEmbedsLoading}
              isEmpty={!socialEmbedsData?.length}
              error={socialEmbedsError}
              icon={FaLink}
              onRefresh={socialEmbedsRefresh}
            >
              <Box overflowY="auto" height="calc(100% - 2rem)">
                <VStack align="stretch" spacing={4}>
                  {socialEmbedsData?.map((embed) => (
                    <Box key={embed.id}>
                      <HStack spacing={2} mb={2}>
                        <Icon 
                          as={
                            embed.platform === 'instagram' ? FaInstagram :
                            embed.platform === 'facebook' ? FaFacebook :
                            embed.platform === 'twitter' ? FaTwitter :
                            embed.platform === 'youtube' ? FaYoutube :
                            embed.platform === 'tiktok' ? FaTiktok :
                            FaLink
                          }
                        />
                        <Text>{embed.title}</Text>
                      </HStack>
                      <Box dangerouslySetInnerHTML={{ __html: embed.embed_code }} />
                    </Box>
                  ))}
                </VStack>
              </Box>
            </SectionCard>
          </ErrorBoundary>
        </CardContainer>

        <CardContainer>
          <ErrorBoundary>
            <SectionCard 
              title="Media" 
              loading={false}
              isEmpty={false}
              error={null}
              icon={FaImage}
            >
              <VStack align="stretch" spacing={6}>
                {mediaEmbedsData.map((media) => (
                  <Box key={media.id}>
                    <HStack spacing={3} mb={3}>
                      <Icon 
                        as={media.type === 'video' ? FaYoutube : FaImage}
                        color={media.type === 'video' ? 'red.500' : 'blue.500'}
                        boxSize={6}
                      />
                      <Text fontSize="lg">{media.title}</Text>
                    </HStack>
                    <Image
                      src={media.thumbnail}
                      alt={media.title}
                      fallback={
                        <Box
                          bg="gray.100"
                          h="200px"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="gray.500" fontSize="lg">Media Preview</Text>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </VStack>
            </SectionCard>
          </ErrorBoundary>
        </CardContainer>
      </SimpleGrid>
    </Box>
  );
};

export default TeamInfoPage;
