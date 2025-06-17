import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  FaBaseballBall,
  FaCamera,
  FaChartLine,
  FaClipboardList,
  FaIdCard,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import GradientIcon from '../components/common/GradientIcon';
import InteractiveMap from '../components/InteractiveMap';
import { ROUTER_CONFIG } from '../config';
import { supabase } from '../lib/supabaseClient';

const FeatureCard = ({ icon, title, description }) => (
  <Box
    bg="brand.surface.base"
    p={6}
    borderRadius="lg"
    boxShadow="lg"
    borderWidth="1px"
    borderColor="brand.border"
    _hover={{ 
      transform: 'translateY(-2px)', 
      transition: '0.2s',
      borderColor: 'brand.primary.hover'
    }}
  >
    <VStack spacing={4} align="center">
      <GradientIcon icon={icon} size="60px" />
      <Heading size="md" color="brand.text.primary">
        {title}
      </Heading>
      <Text color="brand.text.primary">
        {description}
      </Text>
    </VStack>
  </Box>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [teamLocations, setTeamLocations] = useState([]);

  // Fetch team locations for the map
  useEffect(() => {
    const fetchTeamLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('id, name, location_name, latitude, longitude')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);
          
        if (error) throw error;
        
        // Transform data for the map component
        const markers = data.map(team => ({
          id: team.id,
          lat: team.latitude,
          lng: team.longitude,
          popupContent: `<strong>${team.name}</strong><br/>${team.location_name || ''}`,
          name: team.name
        }));
        
        setTeamLocations(markers);
      } catch (error) {
        console.error('Error fetching team locations:', error);
      }
    };
    
    fetchTeamLocations();
  }, []);

  const handleGetStarted = () => {
    // Ensure we're using the correct path from config
    const signinPath = ROUTER_CONFIG.ROUTES.SIGNIN;
    navigate(signinPath);
  };

  const handleMarkerClick = (markerData) => {
    // Navigate to the team page with the correct format
    navigate(`/team/${markerData.id}`);
  };

  const features = [
    {
      icon: FaBaseballBall,
      title: "Team Management",
      description: "Create and manage multiple teams, control privacy settings, and organize your roster with ease. Perfect for coaches and team administrators."
    },
    {
      icon: FaChartLine,
      title: "Advanced Statistics",
      description: "Track comprehensive game statistics, automatically calculate team and player metrics, and visualize performance trends over time."
    },
    {
      icon: FaClipboardList,
      title: "Digital Score Sheets",
      description: "Upload physical scoresheets or use our digital scoring system with OCR and voice recognition for effortless stat recording."
    },
    {
      icon: FaUsers,
      title: "Player Profiles",
      description: "Players can create detailed profiles, connect to team rosters, and track their season progress across multiple teams."
    },
    {
      icon: FaIdCard,
      title: "Baseball Cards",
      description: "Generate custom digital baseball cards featuring current stats, historical data, and personalized designs. Create up to 10 unique cards per player."
    },
    {
      icon: FaCamera,
      title: "Media Integration",
      description: "Share team moments with integrated photo and video galleries. Embed media directly into team pages and news updates."
    },
    {
      icon: FaShieldAlt,
      title: "Secure Access",
      description: "Control who sees your team's information with customizable privacy settings and team passwords for member access."
    },
    {
      icon: FaMapMarkedAlt,
      title: "Interactive Field Map",
      description: "Visualize game locations, track field conditions, and plan travel with our interactive map system. Perfect for managing multiple venues and travel logistics."
    }
  ];

  return (
    <Container maxW="container.xl" py={12} mt="80px">
      <VStack spacing={12}>
        <Box
          bg="brand.surface.base"
          borderRadius="lg"
          p={8}
          width="100%"
          boxShadow="lg"
          borderWidth="1px"
          borderColor="brand.border"
        >
          <VStack spacing={6} textAlign="center">
            <Heading 
              size="2xl" 
              color="var(--content-gradient-middle)"
            >
              Welcome to Diamond Data
            </Heading>
            <Text 
              fontSize="xl" 
              color="brand.text.primary"
              maxW="800px"
            >
              Your all-in-one platform for baseball team management, statistics tracking, and player development.
            </Text>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="app-gradient"
              color="brand.text.primary"
              _hover={{ opacity: 0.9 }}
            >
              Get Started
            </Button>
          </VStack>
        </Box>

        <Box 
          width="100%" 
          bg="brand.background"
        >
          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={8}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </SimpleGrid>
        </Box>

        {/* Interactive Map Section - Now positioned below the feature cards */}
        <Box
          bg="brand.surface.base"
          borderRadius="lg"
          p={4}
          width="100%"
          boxShadow="lg"
          borderWidth="1px"
          borderColor="brand.border"
          height="400px"
        >
          <Heading size="md" mb={4} color="brand.text.primary">
            Baseball Teams Map
          </Heading>
          <Box height="320px" borderRadius="md" overflow="hidden">
            <InteractiveMap
              defaultMarkers={teamLocations}
              showCrosshair={true}
              showPopups={true}
              onMarkerClick={handleMarkerClick}
            />
          </Box>
        </Box>
      </VStack>
    </Container>
  );
}









































