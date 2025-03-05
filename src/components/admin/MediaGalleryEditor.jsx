import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Grid,
  Box,
  Image,
  IconButton,
  useToast,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabaseClient';
import { DEFAULT_IMAGES } from '../../constants/assets';

const MediaGalleryEditor = () => {
  const [media, setMedia] = useState([]);
  const [formData, setFormData] = useState({
    type: 'photo',
    url: '', // Remove any default URL
    title: '',
    source: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('team_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching media',
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
      // Validate URL
      if (!formData.url) {
        throw new Error('URL is required');
      }

      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.url)) {
        throw new Error('Please enter a valid URL');
      }

      // Add media
      const { data, error } = await supabase
        .from('team_media')
        .insert([formData]);

      if (error) throw error;

      setMedia([...media, data[0]]);
      setFormData({
        type: 'photo',
        url: '',
        title: '',
        source: '',
      });

      toast({
        title: 'Media added successfully',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error adding media',
        description: error.message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('team_media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchMedia();
      toast({
        title: 'Media deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting media',
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
            <FormLabel>Type</FormLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
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

          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Source</FormLabel>
            <Input
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Instagram, Facebook, etc."
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="green"
            isLoading={loading}
            loadingText="Adding..."
          >
            Add Media
          </Button>
        </VStack>
      </form>

      <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
        {media.filter(item => item && item.url).map((item) => (
          <Box
            key={item.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            {item.type === 'photo' ? (
              <Image
                src={item.url || DEFAULT_IMAGES.FALLBACK.PHOTO}
                alt={item.title}
                width="100%"
                height="150px"
                objectFit="cover"
                onError={(e) => {
                  e.target.src = DEFAULT_IMAGES.FALLBACK.PHOTO;
                }}
              />
            ) : (
              <Box
                width="100%"
                height="150px"
                backgroundImage={`url(${DEFAULT_IMAGES.FALLBACK.VIDEO})`}
                backgroundSize="cover"
                backgroundPosition="center"
              >
                <Text fontSize="sm" textAlign="center" pt="60px">
                  Video Preview Not Available
                </Text>
              </Box>
            )}
            <Box p={2}>
              <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                {item.title || 'Untitled'}
              </Text>
              {item.source && (
                <Text fontSize="xs" color="gray.500">
                  {item.source}
                </Text>
              )}
              <IconButton
                icon={<DeleteIcon />}
                size="sm"
                position="absolute"
                top={2}
                right={2}
                onClick={() => handleDelete(item.id)}
                colorScheme="red"
                aria-label="Delete media"
              />
            </Box>
          </Box>
        ))}
      </Grid>
    </VStack>
  );
};

export default MediaGalleryEditor;
