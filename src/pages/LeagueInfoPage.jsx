import { Box, SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import CardContainer from '../components/common/CardContainer';
import SectionHeading from '../components/common/SectionHeading';
import SocialMediaEmbed from '../components/SocialMediaEmbed';
import SocialMediaLinks from '../components/SocialMediaLinks';
import TeamNews from '../components/TeamNews';
import WeatherDisplay from '../components/WeatherDisplay';

const LeagueInfoPage = () => {
  return (
    <Box 
      p={6} 
      maxW="1800px" 
      mx="auto"
    >
      <SimpleGrid 
        columns={{ base: 1, lg: 2 }}
        spacing={6}
        w="full"
      >
        {/* Row 1 */}
        <CardContainer 
          h={{ base: "400px", xl: "500px" }}
          overflow="auto"
        >
          <SectionHeading mb={4}>League News</SectionHeading>
          <TeamNews teamId="" news={[]} />
        </CardContainer>
        <CardContainer 
          h={{ base: "400px", xl: "500px" }}
          overflow="auto"
        >
          <SectionHeading mb={4}>Weather</SectionHeading>
          <WeatherDisplay />
        </CardContainer>

        {/* Row 2 */}
        <CardContainer 
          h={{ base: "400px", xl: "500px" }}
          overflow="auto"
        >
          <SectionHeading mb={4}>Photos & Videos</SectionHeading>
          <SocialMediaEmbed />
        </CardContainer>
        <CardContainer 
          h={{ base: "400px", xl: "500px" }}
          overflow="auto"
        >
          <SectionHeading mb={4}>Social Media Links</SectionHeading>
          <SocialMediaLinks />
        </CardContainer>
      </SimpleGrid>
    </Box>
  );
};

export default LeagueInfoPage;
