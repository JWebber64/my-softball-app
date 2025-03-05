import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../context/SimpleAuthContext';
import { ROUTER_CONFIG } from '../constants/routing';
import TeamSearch from '../components/search/TeamSearch';
import MapContainer from '../components/map/MapContainer';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSimpleAuth();

  return (
    <Box w="full" minH="calc(100vh - 160px)" bg="brand.background" p={4}>
      <Container maxW="container.xl" py={8}>
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap={8}
        >
          <GridItem colSpan={{ base: 1, md: 2 }}>
            <Heading size="2xl" textAlign="center" color="brand.text.primary">
              Welcome to Our Sports League Platform
            </Heading>
            
            {!isAuthenticated && (
              <Box textAlign="center" mt={4}>
                <Button
                  bg="brand.primary.base"
                  _hover={{ bg: 'brand.primary.hover' }}
                  color="brand.text.primary"
                  size="lg"
                  onClick={() => navigate(ROUTER_CONFIG.ROUTES.SIGNIN)}
                  w="200px"
                >
                  Sign In / Sign Up
                </Button>
              </Box>
            )}
          </GridItem>

          <GridItem>
            <Box bg="brand.primary.base" p={4} borderRadius="lg">
              <TeamSearch />
            </Box>
          </GridItem>

          <GridItem>
            <Box bg="brand.primary.base" p={4} borderRadius="lg">
              <MapContainer />
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
