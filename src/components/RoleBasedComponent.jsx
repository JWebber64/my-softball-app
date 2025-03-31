import { useRole } from '../hooks/useRole';

const RoleBasedComponent = () => {
  const { role, isLoading } = useRole();

  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {role === 'team-admin' && <TeamAdminContent />}
      {role === 'league-admin' && <LeagueAdminContent />}
      {role === 'player' && <PlayerContent />}
    </div>
  );
};