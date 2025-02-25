import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabaseClient';

const NewsEditor = () => {
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('team_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      toast({
        title: "Error fetching news",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('team_news')
          .update({ title, content })
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast({
          title: "News updated",
          status: "success",
          duration: 3000,
        });
      } else {
        const { error } = await supabase
          .from('team_news')
          .insert([{ title, content }]);
        
        if (error) throw error;
        
        toast({
          title: "News added",
          status: "success",
          duration: 3000,
        });
      }

      setTitle('');
      setContent('');
      setEditingId(null);
      fetchNews();
    } catch (error) {
      toast({
        title: "Error saving news",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setContent(item.content);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('team_news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "News deleted",
        status: "success",
        duration: 3000,
      });

      fetchNews();
    } catch (error) {
      toast({
        title: "Error deleting news",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input
            placeholder="News Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="News Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
          />
          <Button type="submit" colorScheme="green">
            {editingId ? 'Update News' : 'Add News'}
          </Button>
        </VStack>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Content</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {news.map((item) => (
            <Tr key={item.id}>
              <Td>{item.title}</Td>
              <Td>{item.content}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => handleEdit(item)}
                    aria-label="Edit news"
                    size="sm"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete news"
                    size="sm"
                    colorScheme="red"
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};

export default NewsEditor;