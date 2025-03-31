import { Box, Heading, Image, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TeamNews = ({ teamId }) => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('team_id', teamId)
          .order('published_at', { ascending: false });

        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (teamId) {
      fetchNews();
    }
  }, [teamId]);

  if (isLoading) {
    return <Box>Loading news...</Box>;
  }

  if (news.length === 0) {
    return <Box>No news available</Box>;
  }

  return (
    <VStack spacing={6} align="stretch">
      {news.map((item) => (
        <Box 
          key={item.id}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          p={4}
        >
          <Heading size="md" mb={2}>{item.title}</Heading>
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.title}
              mb={4}
              borderRadius="md"
            />
          )}
          <Text>{item.content}</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            {new Date(item.published_at).toLocaleDateString()}
          </Text>
        </Box>
      ))}
    </VStack>
  );
};

TeamNews.propTypes = {
  teamId: PropTypes.string.isRequired
};

export default TeamNews;

