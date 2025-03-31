import { Container, SimpleGrid, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CardContainer from '../components/common/CardContainer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SectionHeading from '../components/common/SectionHeading';
import TeamStandings from '../components/league/TeamStandings';
import PlayerOfWeek from '../components/PlayerOfWeek';
import SocialMediaEmbed from '../components/SocialMediaEmbed';
import SocialMediaLinks from '../components/SocialMediaLinks';
import TeamPlayerCards from '../components/team/TeamPlayerCards';
import TeamNews from '../components/TeamNews';
import TeamSchedule from '../components/TeamSchedule';
import WeatherDisplay from '../components/WeatherDisplay';
import { useTeam } from '../hooks/useTeam';
import { supabase } from '../lib/supabaseClient';
import { weatherService } from '../services/weatherService';

const TeamInfoPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { team: activeTeam } = useTeam();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [nextGameWeather, setNextGameWeather] = useState(null);
  const [nextGameDate, setNextGameDate] = useState(null);
  const toast = useToast(); // Add toast for user feedback

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        let teamId;
        
        // If we're on /team/:id route, use the URL parameter
        if (params.id) {
          teamId = params.id;
        } 
        // If we're on /team-info route, use the active team from context
        else if (activeTeam?.id) {
          teamId = activeTeam.id;
        } 
        // No team ID available
        else {
          toast({
            title: "No Team Selected",
            description: "Please select a team first",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          navigate('/'); // Redirect to home page
          return;
        }

        const { data, error } = await supabase
          .from('teams')
          .select('id, name, location_name, logo_url, is_public, latitude, longitude')
          .match({ id: teamId, is_public: true })
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            title: "Team Not Found",
            description: "The requested team could not be found or is private",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate('/');
          return;
        }

        setTeam(data);
      } catch (error) {
        console.error('Error fetching team:', error);
        toast({
          title: "Error",
          description: "Failed to load team information",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [params.id, activeTeam?.id, navigate, toast]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!team?.latitude || !team?.longitude) return;

      try {
        // Get current weather
        const currentWeatherData = await weatherService.getGameDayForecast({
          lat: team.latitude,
          lng: team.longitude
        }, new Date());
        setCurrentWeather(currentWeatherData);

        // Get next game date from schedule
        const { data: games } = await supabase
          .from('games')
          .select('date')
          .eq('team_id', team.id)
          .gt('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(1)
          .single();

        if (games?.date) {
          setNextGameDate(games.date);
          // Get weather for next game
          const nextGameWeatherData = await weatherService.getGameDayForecast({
            lat: team.latitude,
            lng: team.longitude
          }, new Date(games.date));
          setNextGameWeather(nextGameWeatherData);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeatherData();
  }, [team]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!team) {
    return null;
  }

  return (
    <Container maxW="1800px" py={6} bg="var(--app-background)">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* 1. Standings */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Team Standings</SectionHeading>
          <TeamStandings />
        </CardContainer>

        {/* 2. Player of the Week */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Player of the Week</SectionHeading>
          <PlayerOfWeek teamId={team.id} />
        </CardContainer>

        {/* 3. Schedule */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Team Schedule</SectionHeading>
          <TeamSchedule teamId={team.id} />
        </CardContainer>

        {/* 4. Player Profiles */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Player Profiles</SectionHeading>
          <TeamPlayerCards teamId={team.id} />
        </CardContainer>

        {/* 5. News */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Team News</SectionHeading>
          <TeamNews teamId={team.id} />
        </CardContainer>

        {/* 6. Weather */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Weather</SectionHeading>
          <WeatherDisplay 
            currentWeather={currentWeather}
            nextGameWeather={nextGameWeather}
            nextGameDate={nextGameDate}
          />
        </CardContainer>

        {/* 7. Embedded photos/videos */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Media Feed</SectionHeading>
          <SocialMediaEmbed teamId={team.id} />
        </CardContainer>

        {/* 8. Social Media Links */}
        <CardContainer 
          bg="var(--app-surface)"
          borderColor="var(--app-border)"
          boxShadow="var(--app-shadow)"
        >
          <SectionHeading color="var(--app-text)">Social Media</SectionHeading>
          <SocialMediaLinks teamId={team.id} />
        </CardContainer>
      </SimpleGrid>
    </Container>
  );
};

TeamInfoPage.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location_name: PropTypes.string.isRequired,
    logo_url: PropTypes.string,
    is_public: PropTypes.bool.isRequired,
  }),
};

export default TeamInfoPage;
