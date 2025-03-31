import {
  Box,
  Container,
  Heading,
  SimpleGrid
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsEditor from '../components/admin/NewsEditor';
import PlayerOfWeekEditor from '../components/admin/PlayerOfWeekEditor';
import RosterEditor from '../components/admin/RosterEditor';
import ScheduleEditor from '../components/admin/ScheduleEditor';
import SocialEmbedEditor from '../components/admin/SocialEmbedEditor';
import SocialMediaEditor from '../components/admin/SocialMediaEditor';
import TeamDetailsEditor from '../components/admin/TeamDetailsEditor';
import TeamFinancesEditor from '../components/admin/TeamFinancesEditor';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTER_CONFIG } from '../config';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { checkTeamAdminAccess } from '../lib/roles';

const containerStyles = {
  bg: 'brand.surface.base',
  p: 6,
  borderRadius: 'lg',
  boxShadow: 'brand.shadow'
};

const headerStyles = {
  size: 'md',
  mb: 4,
  color: 'brand.text.primary'
};

const buttonStyles = {
  bg: 'brand.surface.base',
  color: "brand.text.primary",
  _hover: {
    opacity: 0.8,
    transform: 'translateY(-2px)',
    boxShadow: 'lg',
  },
  _active: {
    opacity: 0.9,
    transform: 'translateY(0)',
  }
};

const TeamAdminPage = () => {
  const { user } = useAuth();
  const { team } = useTeam();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          navigate(ROUTER_CONFIG.ROUTES.SIGNIN);
          return;
        }
        
        const hasAccess = await checkTeamAdminAccess();
        if (!hasAccess) {
          navigate(ROUTER_CONFIG.ROUTES.HOME);
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Access check failed:', error);
        navigate(ROUTER_CONFIG.ROUTES.HOME);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <Container maxW="1800px" py={6} bg="brand.background">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* 1. Team Details */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Details</Heading>
          <TeamDetailsEditor 
            isDisabled={!team} 
          />
        </Box>

        {/* 2. Player of the Week */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Player of the Week</Heading>
          <PlayerOfWeekEditor 
            isDisabled={!team} 
          />
        </Box>

        {/* 3. Team Schedule */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Schedule</Heading>
          <ScheduleEditor 
            teamId={team?.id}
            isDisabled={!team} 
          />
        </Box>

        {/* 4. Team News */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team News</Heading>
          <NewsEditor 
            teamId={team?.id} 
            isDisabled={!team} 
          />
        </Box>

        {/* 5. Team Roster */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Roster</Heading>
          <RosterEditor isDisabled={!team} />
        </Box>

        {/* 6. Team Finances */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Finances</Heading>
          <TeamFinancesEditor 
            teamId={team?.id || ''} 
            isDisabled={!team} 
          />
        </Box>

        {/* 7. Embedded Photos/Videos */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Photos & Videos</Heading>
          <SocialEmbedEditor 
            teamId={team?.id} 
            isDisabled={!team}
          />
        </Box>

        {/* 8. Social Media Links */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Social Media Links</Heading>
          <SocialMediaEditor 
            teamId={team?.id || ''} // Add empty string fallback
            isDisabled={!team}
          />
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default TeamAdminPage;
