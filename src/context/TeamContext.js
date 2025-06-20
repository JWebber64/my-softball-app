import { createContext, useContext } from 'react';

export const TeamContext = createContext(null);

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}


