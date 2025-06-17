import { useContext } from 'react';
import { TeamContext } from '../context/TeamContext';

export function useTeam() {
  const context = useContext(TeamContext);
  
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  
  return {
    team: context.team, // Use consistent naming
    currentTeam: context.team, // For backward compatibility
    setTeam: context.setTeam,
    loading: context.loading,
    error: context.error,
    refetchTeam: context.refetchTeam
  };
}





