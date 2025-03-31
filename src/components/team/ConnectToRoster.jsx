const ConnectToRoster = () => {
  const { profile } = usePlayerProfile();
  const toast = useToast();

  const handleConnect = async (rosterId) => {
    try {
      await teamInfoService.connectProfileToRoster({
        profileId: profile.id,
        rosterId: rosterId
      });
      
      toast({
        title: "Connected to roster",
        description: "Your profile is now visible on the team page",
        status: "success"
      });
    } catch (error) {
      toast({
        title: "Error connecting to roster",
        description: error.message,
        status: "error"
      });
    }
  };

  return (
    <Box>
      <Heading size="sm" mb={4}>Connect to Team Roster</Heading>
      <Text fontSize="sm" mb={4}>
        Select your name from the roster to share your profile with the team
      </Text>
      <UnconnectedRosterList onConnect={handleConnect} />
    </Box>
  );
};




