// React and PropTypes
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

// Chakra UI components
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';

// Services and utilities
import { supabase } from '../../lib/supabaseClient';
import { formFieldStyles } from '../../styles/formFieldStyles';

const NewsEditor = ({ teamId = null, isDisabled = false }) => {
  const [newsData, setNewsData] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // If no teamId is provided, treat as disabled
  const effectivelyDisabled = isDisabled || !teamId;

  const handlePublish = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert({
          team_id: teamId,
          title: title,
          content: content,
          image_url: image_url,
          published_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setNewsData([data, ...newsData]);
      setTitle('');
      setContent('');
      setImageUrl('');
      
      toast({
        title: 'News published successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error publishing news',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const fetchNews = useCallback(async () => {
    if (!teamId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_news')
        .select('*')
        .eq('team_id', teamId)
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setNewsData(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching news',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('team_news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNewsData(newsData.filter(item => item.id !== id));
      
      toast({
        title: 'News deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting news',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (effectivelyDisabled) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        Please select a team to manage news articles
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Title</FormLabel>
        <Input
          {...formFieldStyles}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Content</FormLabel>
        <Textarea
          {...formFieldStyles}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Image URL (optional)</FormLabel>
        <Input
          {...formFieldStyles}
          placeholder="Image URL (optional)"
          value={image_url}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </FormControl>
      <Button
        isDisabled={effectivelyDisabled || !title || !content}
        onClick={handlePublish}
      >
        Publish
      </Button>
    </VStack>
  );
};

NewsEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool
};

export default NewsEditor;













