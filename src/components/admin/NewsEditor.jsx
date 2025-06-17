// React and PropTypes
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

// Chakra UI components
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
  VStack
} from '@chakra-ui/react';

// Services and utilities
import { supabase } from '../../lib/supabaseClient';
import ActionButtons from '../common/ActionButtons';
import StyledModal from '../common/StyledModal';

// Add custom form field styles with black text
const customFormFieldStyles = {
  bg: "brand.surface.input",
  color: "black",
  borderColor: "brand.border",
  _hover: { borderColor: 'brand.primary.hover' },
  _focus: { 
    borderColor: 'brand.primary.hover',
    boxShadow: 'none'
  },
  _placeholder: {
    color: 'black'  // Change placeholder color to black
  },
  sx: {
    '& option': {
      bg: 'brand.surface.base',
      color: 'black'
    },
    '&::placeholder': {
      color: 'black !important'  // Additional CSS for placeholder
    }
  }
};

const NewsEditor = ({ teamId, isDisabled, buttonProps }) => {
  const [newsData, setNewsData] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const toast = useToast();

  const handleAddNews = () => {
    setEditingNews(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setIsOpen(true);
  };

  const handleEditNews = (news) => {
    setEditingNews(news);
    setTitle(news.title);
    setContent(news.content);
    setImageUrl(news.image_url || '');
    setIsOpen(true);
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId);

      if (error) throw error;

      setNewsData(newsData.filter(item => item.id !== newsId));
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingNews) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update({
            title: title,
            content: content,
            image_url: image_url,
          })
          .eq('id', editingNews.id);

        if (error) throw error;

        // Update local state
        setNewsData(newsData.map(item => 
          item.id === editingNews.id 
            ? { ...item, title, content, image_url } 
            : item
        ));
        
        toast({
          title: 'News updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Add new news
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
        
        toast({
          title: 'News published successfully',
          status: 'success',
          duration: 3000,
        });
      }

      setTitle('');
      setContent('');
      setImageUrl('');
      setIsOpen(false);
      setEditingNews(null);
    } catch (error) {
      toast({
        title: editingNews ? 'Error updating news' : 'Error publishing news',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const onClose = () => {
    setIsOpen(false);
    setTitle('');
    setContent('');
    setImageUrl('');
    setEditingNews(null);
  };

  // If no teamId is provided, treat as disabled
  const effectivelyDisabled = isDisabled || !teamId;

  const fetchNews = useCallback(async () => {
    if (!teamId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('team_id', teamId)
        .order('published_at', { ascending: false });

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

  const modalFooter = (
    <>
      <Button 
        className="app-gradient"
        color="brand.text.primary"
        _hover={{ opacity: 0.9 }}
        mr="auto"
        onClick={handleSave}
      >
        {editingNews ? 'Save' : 'Add'}
      </Button>
      <Button 
        variant="cancel"
        onClick={onClose}
      >
        Cancel
      </Button>
    </>
  );

  if (effectivelyDisabled) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        Please select a team to manage news articles
      </Box>
    );
  }

  return (
    <Flex direction="column" align="center" width="100%">
      <Button
        {...buttonProps.primary}
        onClick={handleAddNews}
        isDisabled={isDisabled}
        mb={6}
      >
        Add News Item
      </Button>

      {/* News Table */}
      {newsData.length > 0 && (
        <Box overflowX="auto" width="100%" maxWidth="900px">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Published</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {newsData.map((news) => (
                <Tr key={news.id}>
                  <Td>{news.title}</Td>
                  <Td>{new Date(news.published_at).toLocaleDateString()}</Td>
                  <Td>
                    <ActionButtons 
                      onEdit={() => handleEditNews(news)} 
                      onDelete={() => handleDeleteNews(news.id)}
                      editLabel="Edit news"
                      deleteLabel="Delete news"
                      isDisabled={isDisabled}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <StyledModal 
        isOpen={isOpen} 
        onClose={onClose}
        title={editingNews ? 'Edit News' : 'Add News'}
        footer={modalFooter}
      >
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              {...customFormFieldStyles}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="News title"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Content</FormLabel>
            <Textarea
              {...customFormFieldStyles}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="News content"
              minH="150px"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Image URL</FormLabel>
            <Input
              {...customFormFieldStyles}
              value={image_url}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </FormControl>
        </VStack>
      </StyledModal> 
    </Flex>
  );
};

NewsEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool,
  buttonProps: PropTypes.shape({
    primary: PropTypes.object,
    secondary: PropTypes.object
  })
};

export default NewsEditor;






