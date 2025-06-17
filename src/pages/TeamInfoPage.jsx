import {
  Box,
  Center,
  Container, Heading, SimpleGrid, Spinner,
  Text
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlayerOfWeek from "../components/PlayerOfWeek";
import SocialMediaEmbed from '../components/SocialMediaEmbed';
import SocialMediaLinks from '../components/SocialMediaLinks';
import TeamPlayerCards from '../components/team/TeamPlayerCards';
import TeamRoster from '../components/team/TeamRoster';
import TeamNews from '../components/TeamNews';
import TeamSchedule from "../components/TeamSchedule";
import WeatherDisplay from '../components/WeatherDisplay';
import { useTeam } from '../hooks/useTeam';
import { useTeamData } from '../hooks/useTeamData';
import { supabase } from '../lib/supabaseClient';

const TeamInfoPage = () => {
  const { id } = useParams(); // Get team ID from URL
  const { team: currentTeam } = useTeam();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get the effective team ID (from URL or context)
  const effectiveTeamId = id || (currentTeam?.id || null);
  
  // Use the useTeamData hook to get weather data
  const { weatherData, weatherLoading } = useTeamData(effectiveTeamId);
  
  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      
      try {
        // If we have an ID from URL, use that, otherwise use current team
        const teamId = id || (currentTeam?.id || null);
        
        if (!teamId) {
          console.log('No team ID available');
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();
          
        if (error) throw error;
        setTeamData(data);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [id, currentTeam]);
  
  // For debugging
  useEffect(() => {
    console.log('TeamInfoPage - teamId from params:', id);
    console.log('TeamInfoPage - team from context:', currentTeam);
    console.log('TeamInfoPage - effectiveTeamId:', effectiveTeamId);
    console.log('TeamInfoPage - teamData:', teamData);
  }, [id, currentTeam, effectiveTeamId, teamData]);

  // Add debugging to see what's happening with the weather data
  useEffect(() => {
    console.log('TeamInfoPage - weatherData:', weatherData);
    console.log('TeamInfoPage - weatherLoading:', weatherLoading);
  }, [weatherData, weatherLoading]);

  // Find the next game
  const nextGame = teamData?.schedule?.find(game => 
    new Date(game.date) > new Date() && 
    game.status.toLowerCase() !== 'cancelled'
  );

  // Define consistent container styles
  const containerStyles = {
    bg: 'brand.surface.base',
    borderColor: 'brand.border',
    borderWidth: '1px',
    borderRadius: 'md',
    p: 4,
    mb: 4,
    textAlign: 'center'
  };

  const headerStyles = {
    size: "md",
    color: "brand.text.primary",
    mb: 4,
    textAlign: 'center'
  };

  // Show loading state
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Show message if no team ID is available
  if (!effectiveTeamId) {
    return (
      <Center h="100vh">
        <Text>No team selected. Please select a team.</Text>
      </Center>
    );
  }

  return (
    <Container maxW="1800px" py={6} px={4} mt="80px">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Upcoming Schedule - Now in top left position */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Upcoming Schedule</Heading>
          {effectiveTeamId ? (
            <TeamSchedule teamId={effectiveTeamId} />
          ) : (
            <Text>No team selected</Text>
          )}
        </Box>
        
        {/* Player of the Week */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Player of the Week</Heading>
          <PlayerOfWeek showButtons={false} useSimpleView={true} />
        </Box>
        
        {/* Team Roster */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team Roster</Heading>
          {effectiveTeamId ? (
            <TeamRoster teamId={effectiveTeamId} />
          ) : (
            <Text>No team selected</Text>
          )}
        </Box>
        
        {/* Player Profiles */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Player Profiles</Heading>
          <TeamPlayerCards teamData={teamData} />
        </Box>
        
        {/* Team News */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Team News</Heading>
          {effectiveTeamId ? (
            <TeamNews teamId={effectiveTeamId} news={teamData?.news || []} />
          ) : (
            <Text>No team selected</Text>
          )}
        </Box>
        
        {/* Weather */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Weather</Heading>
          <Box display="flex" justifyContent="center" width="100%">
            {/* Add this debugging code before rendering the WeatherDisplay */}
            {console.log('TeamInfoPage weather props:', {
              nextGame: nextGame,
              nextGameDate: nextGame?.date,
              nextGameOpponent: nextGame?.opponent,
              weatherData: weatherData
            })}
            
            
            <WeatherDisplay 
              currentWeather={weatherData?.current}
              nextGameWeather={weatherData?.nextGame}
              nextGameDate={nextGame?.date}
              nextGameOpponent={nextGame?.opponent}
              location={teamData?.location_name} 
              isLoading={weatherLoading}
            />
            
          </Box>
        </Box>
        
        {/* Social Media Embeds */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Social Media</Heading>
          {effectiveTeamId ? (
            <SocialMediaEmbed teamId={effectiveTeamId} />
          ) : (
            <Text>No team selected</Text>
          )}
        </Box>
        
        {/* Social Media Links */}
        <Box {...containerStyles}>
          <Heading {...headerStyles}>Connect With Us</Heading>
          {effectiveTeamId ? (
            <SocialMediaLinks teamId={effectiveTeamId} />
          ) : (
            <Text>No team selected</Text>
          )}
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default TeamInfoPage;
