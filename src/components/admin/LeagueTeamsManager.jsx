import { teamService } from '../../services/teamService';
// Remove any imports from the deleted utils files

export default function LeagueTeamsManager() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching teams',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await teamService.deleteTeam(teamId);
      setTeams(teams.filter(team => team.id !== teamId));
      toast({
        title: 'Team deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting team',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleViewMembers = (team) => {
    setSelectedTeam(team);
    onMembersOpen();
  };

  const handleTeamCreated = async (newTeam) => {
    console.log('New team created:', newTeam);
    // Refresh the teams list to ensure we have the latest data
    await fetchTeams();
  };

  if (isLoading) return <Box>Loading...</Box>;

  return (
    <Box bg="var(--app-surface)" p={6} borderRadius="lg">
      <Heading size="md" mb={4} color="var(--app-text)">League Teams</Heading>
      
      <Button
        variant="primary"
        onClick={onOpen}
        mb={4}
      >
        Create New Team
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th color="var(--app-text-secondary)">Team Name</Th>
            <Th color="var(--app-text-secondary)">Location</Th>
            <Th color="var(--app-text-secondary)">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {teams.map(team => (
            <Tr key={team.id}>
              <Td color="var(--app-text)">{team.name}</Td>
              <Td color="var(--app-text)">{team.location_name || '-'}</Td>
              <Td>
                <Button
                  size="sm"
                  mr={2}
                  variant="secondary"
                  onClick={() => handleViewMembers(team)}
                >
                  Members
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteTeam(team.id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <TeamDetailsEditor
        isOpen={isOpen}
        onClose={onClose}
        onTeamCreated={handleTeamCreated}
      />
    </Box>
  );
}






