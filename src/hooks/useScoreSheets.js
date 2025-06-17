import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useScoreSheets = (teamId) => {
  const [scoreSheets, setScoreSheets] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScoreSheets = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Use the new security definer function instead of direct table access
        const { data, error } = await supabase
          .rpc('get_team_score_sheets', { p_team_id: teamId });
        
        if (error) throw error;
        
        setScoreSheets(data || []);
        if (data && data.length > 0) {
          setCurrentSheet(data[0]);
        }
      } catch (err) {
        console.error('Error fetching score sheets:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScoreSheets();
    
    // Set up real-time subscription for score sheets
    const subscription = supabase
      .channel('score_sheets_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'score_sheets',
          filter: `team_id=eq.${teamId}`
        }, 
        (payload) => {
          // Refresh the data when changes occur
          fetchScoreSheets();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [teamId]);

  // Navigate to a specific game by index
  const navigateToGame = (index) => {
    if (index >= 0 && index < scoreSheets.length) {
      setCurrentSheet(scoreSheets[index]);
      setCurrentIndex(index);
    }
  };

  // Get adjacent games for navigation
  const getAdjacentGames = () => {
    return {
      prev: currentIndex > 0 ? scoreSheets[currentIndex - 1] : null,
      next: currentIndex < scoreSheets.length - 1 ? scoreSheets[currentIndex + 1] : null
    };
  };

  // Refresh the data
  const refresh = async () => {
    if (!teamId) return;
    
    try {
      setIsLoading(true);
      // Use the new security definer function
      const { data, error } = await supabase
        .rpc('get_team_score_sheets', { p_team_id: teamId });
        
      if (error) throw error;
      
      setScoreSheets(data || []);
      if (data && data.length > 0) {
        setCurrentSheet(data[0]);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Error refreshing score sheets:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    scoreSheets, 
    currentSheet, 
    isLoading, 
    error, 
    navigateToGame, 
    getAdjacentGames,
    refresh,
    totalGames: scoreSheets.length
  };
};



