import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { weatherService } from '../services/weatherService';

export const useTeamData = (teamId) => {
  const [team, setTeam] = useState(null);
  const [nextGame, setNextGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for weather data
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Add this function to fetch weather data
  const fetchWeatherData = async (team) => {
    if (!team || !team.latitude || !team.longitude) {
      console.log('No location data available for weather');
      return null;
    }
    
    try {
      const location = {
        lat: team.latitude,
        lng: team.longitude
      };
      
      console.log('Fetching weather with location:', location);
      
      const currentWeather = await weatherService.getCurrentWeather(location);
      console.log('Current weather result:', currentWeather);
      
      // If there's a next game, get weather for that date too
      let nextGameWeather = null;
      
      // Make sure we're correctly identifying the next game
      const nextGame = team?.schedule?.find(game => 
        new Date(game.date) > new Date() && 
        game.status.toLowerCase() !== 'cancelled'
      );
      if (nextGame && nextGame.date) {
        console.log('Fetching next game weather for date:', nextGame.date);
        nextGameWeather = await weatherService.getGameDayForecast(location, nextGame.date);
        console.log('Next game weather result:', nextGameWeather);
      }
      
      return {
        current: currentWeather,
        nextGame: nextGameWeather
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch team details
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();
          
        if (teamError) throw teamError;
        
        // Fetch next game - fixing the column names
        const today = new Date().toISOString();
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .or(`home_team.eq.${teamId},away_team.eq.${teamId}`)
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(1);
          
        if (gameError) throw gameError;
        
        // Set the team data
        setTeam(teamData);
        
        // Set the next game if available
        if (gameData && gameData.length > 0) {
          const game = gameData[0];
          const isHomeTeam = game.home_team === teamId;
          
          setNextGame({
            ...game,
            isHomeTeam,
            opponent: isHomeTeam ? game.away_team_name : game.home_team_name
          });
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  useEffect(() => {
    const getWeatherData = async () => {
      if (team && team.latitude && team.longitude) {
        console.log('Team has location data, fetching weather:', {
          latitude: team.latitude,
          longitude: team.longitude
        });
        setWeatherLoading(true);
        const data = await fetchWeatherData(team);
        
        // Make sure we're correctly identifying the next game
        const nextGame = team?.schedule?.find(game => 
          new Date(game.date) > new Date() && 
          game.status.toLowerCase() !== 'cancelled'
        );
        setWeatherData(data);
        setWeatherLoading(false);
      } else {
        console.log('No location data available for weather:', team);
        setWeatherData(null);
      }
    };

    if (team) {
      getWeatherData();
    }
  }, [team, nextGame]);

  return { team, nextGame, loading, error, weatherData, weatherLoading };
};
