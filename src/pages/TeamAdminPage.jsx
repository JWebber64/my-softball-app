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
  Text,
  Spinner,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../context/SimpleAuthContext';

const TeamAdminPage = () => {
  const { user, isAdmin, loading } = useSimpleAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Only check access after auth loading is complete
    if (!loading) {
      checkAdminAccess();
    }
  }, [loading, user, isAdmin]);

  const checkAdminAccess = () => {
    console.log('Checking admin access:', { user, isAdmin, loading });
    
    // For development, we'll allow access without admin rights
    // In production, uncomment the following:
    /*
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        status: "warning",
        duration: 5000,
      });
      navigate('/');
      return;
    }
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be a team administrator to access this page.",
        status: "error",
        duration: 5000,
      });
      navigate('/');
      return;
    }
    */
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Heading mb={6}>Team Administration</Heading>
      
      <Tabs colorScheme="green" index={activeTab} onChange={setActiveTab}>
        <TabList mb={4}>
          <Tab>Team Management</Tab>
          <Tab>Player Management</Tab>
          <Tab>Schedule</Tab>
          <Tab>Settings</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Team Details</Heading>
                </CardHeader>
                <CardBody>
                  <Text>Manage your team's basic information, logo, and colors.</Text>
                  <Button mt={4} colorScheme="green">Edit Team Details</Button>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <Heading size="md">Team Statistics</Heading>
                </CardHeader>
                <CardBody>
                  <Text>View and manage team-level statistics and performance metrics.</Text>
                  <Button mt={4} colorScheme="green">View Statistics</Button>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel>
            <Text>Player management content will go here.</Text>
          </TabPanel>
          
          <TabPanel>
            <Text>Schedule management content will go here.</Text>
          </TabPanel>
          
          <TabPanel>
            <Text>Settings content will go here.</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TeamAdminPage;
