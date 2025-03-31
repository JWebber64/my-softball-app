import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack
} from '@chakra-ui/react';
import React, { useState } from 'react';
import CreateLeagueModal from '../components/admin/CreateLeagueModal';
import CreateTournamentModal from '../components/admin/CreateTournamentModal';
import LeagueDetailsEditor from '../components/admin/LeagueDetailsEditor';
import LeagueScheduleManager from '../components/admin/LeagueScheduleManager';
import LeagueTeamsManager from '../components/admin/LeagueTeamsManager';
import TournamentManager from '../components/admin/TournamentManager';
import { useAuth } from '../hooks';

const LeagueAdminPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);

  const handleCreateLeagueSuccess = (leagueData) => {
    updateUser({ ...user, league_id: leagueData.id });
  };

  const handleCreateTournamentSuccess = () => {
    // Refresh tournament list in TournamentManager component
    // This will be handled through context or prop drilling
  };

  return (
    <Container maxW="1200px" py={6}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="lg">League Administration</Heading>
          {!user?.league_id && (
            <Button
              colorScheme="brand"
              onClick={() => setIsCreateLeagueModalOpen(true)}
            >
              Create League
            </Button>
          )}
        </HStack>

        {user?.league_id ? (
          <Tabs 
            index={activeTab} 
            onChange={setActiveTab}
            variant="enclosed"
            colorScheme="brand"
          >
            <TabList>
              <Tab>League Details</Tab>
              <Tab>Teams</Tab>
              <Tab>Schedule</Tab>
              <Tab>Tournaments</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <LeagueDetailsEditor leagueId={user.league_id} />
              </TabPanel>
              <TabPanel>
                <LeagueTeamsManager leagueId={user.league_id} />
              </TabPanel>
              <TabPanel>
                <LeagueScheduleManager leagueId={user.league_id} />
              </TabPanel>
              <TabPanel>
                <Box>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Tournaments</Heading>
                    <Button
                      colorScheme="brand"
                      onClick={() => setIsCreateTournamentModalOpen(true)}
                    >
                      Create Tournament
                    </Button>
                  </HStack>
                  <TournamentManager leagueId={user.league_id} />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <VStack spacing={4} p={8} align="center">
            <Heading size="md">No League Found</Heading>
            <Button
              colorScheme="brand"
              onClick={() => setIsCreateLeagueModalOpen(true)}
            >
              Create Your First League
            </Button>
          </VStack>
        )}

        <CreateLeagueModal
          isOpen={isCreateLeagueModalOpen}
          onClose={() => setIsCreateLeagueModalOpen(false)}
          onSuccess={handleCreateLeagueSuccess}
        />
        
        {/* Only render CreateTournamentModal if user has a league_id */}
        {user?.league_id && (
          <CreateTournamentModal
            isOpen={isCreateTournamentModalOpen}
            onClose={() => setIsCreateTournamentModalOpen(false)}
            onSuccess={handleCreateTournamentSuccess}
            leagueId={user.league_id}
          />
        )}
      </VStack>
    </Container>
  );
};

export default LeagueAdminPage;
