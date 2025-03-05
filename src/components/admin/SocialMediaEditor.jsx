import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabaseClient';

const SocialMediaEditor = () => {
  const [links, setLinks] = useState([]);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    username: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('team_social_media')
        .select('*')
        .order('platform');

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching social media links',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('team_social_media')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('team_social_media')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({ platform: '', url: '', username: '' });
      setEditingId(null);
      fetchLinks();
      toast({
        title: `Social media link ${editingId ? 'updated' : 'added'} successfully`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error saving social media link',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link) => {
    setFormData(link);
    setEditingId(link.id);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('team_social_media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchLinks();
      toast({
        title: 'Social media link deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting social media link',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Platform</FormLabel>
            <Select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              <option value="">Select Platform</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>URL</FormLabel>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="@username"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="green"
            isLoading={loading}
            loadingText="Saving..."
          >
            {editingId ? 'Update Link' : 'Add Link'}
          </Button>
        </VStack>
      </form>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Platform</Th>
            <Th>Username</Th>
            <Th>URL</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {links.map((link) => (
            <Tr key={link.id}>
              <Td>{link.platform}</Td>
              <Td>{link.username}</Td>
              <Td>{link.url}</Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  onClick={() => handleEdit(link)}
                  mr={2}
                  aria-label="Edit"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleDelete(link.id)}
                  aria-label="Delete"
                  colorScheme="red"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};

export default SocialMediaEditor;
