import { Box, Flex, Select, Spinner, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formFieldStyles } from '../../styles/formFieldStyles';
import GameCard from '../GameCard';

const GameResults = ({ teamId, sampleGames }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);
  const [allGames, setAllGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // Use sample data if provided
        if (sampleGames) {
          setAllGames(sampleGames);
          setGames(sampleGames.slice(0, displayCount));
          setLoading(false);
          return;
        }
        
        if (!teamId) {
          throw new Error("No team ID provided");
        }
        
        // First try to get games from score_sheets table
        const { data: sheetData, error: sheetError } = await supabase
          .from('score_sheets')
          .select('id, game_number, game_date, final_score, opponent_name')
          .eq('team_id', teamId)
          .order('game_date', { ascending: false })
          .limit(20);
          
        // Then get games from games table
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('id, date, home_team, away_team, home_score, away_score, location, opponent')
          .or(`home_team.eq.${teamId},away_team.eq.${teamId}`)
          .order('date', { ascending: false })
          .limit(20);
          
        if (sheetError && gameError) throw sheetError;
        
        // Combine and format the data
        const combinedGames = [];
        
        // Add score sheet games
        if (sheetData) {
          sheetData.forEach(sheet => {
            combinedGames.push({
              id: sheet.id,
              date: sheet.game_date,
              opponent: sheet.opponent_name,
              score: sheet.final_score,
              fromScoreSheet: true,
              gameNumber: sheet.game_number
            });
          });
        }
        
        // Add regular games
        if (gameData) {
          gameData.forEach(game => {
            const isHomeTeam = game.home_team === teamId;
            combinedGames.push({
              id: game.id,
              date: game.date,
              opponent: game.opponent || (isHomeTeam ? 'Away Team' : 'Home Team'),
              location: game.location,
              homeScore: game.home_score,
              awayScore: game.away_score,
              isHomeTeam: isHomeTeam,
              fromScoreSheet: false
            });
          });
        }
        
        // Sort by date (newest first)
        combinedGames.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setAllGames(combinedGames);
        setGames(combinedGames.slice(0, displayCount));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching games:", error);
        setLoading(false);
      }
    };

    fetchGames();
  }, [teamId, sampleGames]);

  // Update displayed games when displayCount changes
  useEffect(() => {
    setGames(allGames.slice(0, displayCount));
  }, [displayCount, allGames]);

  const handleDisplayCountChange = (e) => {
    setDisplayCount(Number(e.target.value));
  };

  if (loading) return <Spinner />;
  if (allGames.length === 0) return <Text>No games found</Text>;

  return (
    <VStack spacing={4} align="stretch">
      <Flex justify="flex-end" mb={2}>
        <Box width="150px">
          <Select
            size="sm"
            value={displayCount}
            onChange={handleDisplayCountChange}
            {...formFieldStyles}
          >
            <option value={3}>Last 3 games</option>
            <option value={5}>Last 5 games</option>
            <option value={10}>Last 10 games</option>
            <option value={15}>Last 15 games</option>
            <option value={20}>Last 20 games</option>
          </Select>
        </Box>
      </Flex>
      
      {games.map(game => (
        <GameCard key={game.id} game={game} teamId={teamId} />
      ))}
    </VStack>
  );
};

export default GameResults;



