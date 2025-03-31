import { useCallback, useContext } from 'react';
import { TeamContext } from '../context/TeamContext';

export const useTeam = () => {
  const context = useContext(TeamContext);
  
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  
  const { team, setTeam, isLoading, refreshTeam } = context;
  
  const setTeamWithValidation = useCallback((newTeam) => {
    console.log('useTeam: Setting team with validation:', newTeam);
    if (!newTeam || typeof newTeam !== 'object') {
      console.error('useTeam: Invalid team object:', newTeam);
      return;
    }
    
    if (!newTeam.id || !newTeam.name) {
      console.error('useTeam: Team object missing required fields:', newTeam);
      return;
    }
    
    console.log('useTeam: Calling context setTeam with:', newTeam);
    setTeam(newTeam);
  }, [setTeam]);

  return {
    team,
    setTeam: setTeamWithValidation,
    isLoading,
    refreshTeam
  };
};











