import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack
} from '@chakra-ui/react';
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
import { Link } from 'react-router-dom';
import GradientIcon from '../components/common/GradientIcon';
import { ROUTER_CONFIG } from '../config';

const FeatureCard = ({ icon, title, description }) => (
  <Box
    bg="var(--app-surface)"
    p={6}
    borderRadius="lg"
    boxShadow="xl"
    _hover={{ transform: 'translateY(-2px)', transition: '0.2s' }}
  >
    <VStack spacing={4} align="center">
      <GradientIcon icon={icon} size="60px" />
      <Heading size="md" color="var(--app-text)" textAlign="center">
        {title}
      </Heading>
      <Text color="var(--app-text)" textAlign="center">
        {description}
      </Text>
    </VStack>
  </Box>
);

export default function HomePage() {
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
    <Box minH="100vh" bg="brand.background">
      <Container maxW="container.xl" py={12}>
        <VStack spacing={12}>
          <Box
            bg="brand.surface.base"
            borderRadius="lg"
            p={8}
            width="100%"
            boxShadow="brand.shadow"
            border="1px"
            borderColor="brand.border"
          >
            <VStack spacing={6} textAlign="center">
              <Heading 
                size="2xl" 
                color="brand.text.primary"
              >
                Welcome to Diamond Data
              </Heading>
              <Text 
                fontSize="xl" 
                color="brand.text.primary"
                maxW="800px"
              >
                Your all-in-one platform for baseball team management, statistics tracking, and player development. Join thousands of teams already elevating their game with our comprehensive tools.
              </Text>
              <Button
                as={Link}
                to={ROUTER_CONFIG.ROUTES.SIGNIN}
                variant="primary"
              >
                Get Started
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}




