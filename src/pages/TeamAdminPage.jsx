import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Heading,
} from '@chakra-ui/react';
import NewsEditor from '../components/admin/NewsEditor';
import ScheduleEditor from '../components/admin/ScheduleEditor';
import RosterEditor from '../components/admin/RosterEditor';
import PlayerOfWeekEditor from '../components/admin/PlayerOfWeekEditor';
import SocialMediaEditor from '../components/admin/SocialMediaEditor';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeamAdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      if (!user || !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You must be a team administrator to access this page.",
          status: "error",
          duration: 5000,
        });
        navigate('/');
        return;
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Heading mb={6}>Team Administration</Heading>
      
      <Tabs variant="enclosed" colorScheme="green">
        <TabList>
          <Tab>News</Tab>
          <Tab>Schedule</Tab>
          <Tab>Roster</Tab>
          <Tab>Players of the Week</Tab>
          <Tab>Social Media</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <NewsEditor />
          </TabPanel>
          <TabPanel>
            <ScheduleEditor />
          </TabPanel>
          <TabPanel>
            <RosterEditor />
          </TabPanel>
          <TabPanel>
            <PlayerOfWeekEditor />
          </TabPanel>
          <TabPanel>
            <SocialMediaEditor />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TeamAdminPage;
