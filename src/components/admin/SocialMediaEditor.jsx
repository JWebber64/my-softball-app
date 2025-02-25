import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Heading,
  SimpleGrid,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';

const SocialMediaEditor = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      toast({
        title: 'Error fetching social media links',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '', id: Date.now() }]);
  };

  const handleRemoveLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setSocialLinks(updatedLinks);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Filter out empty entries
      const validLinks = socialLinks.filter(link => link.platform && link.url);
      
      const { error } = await supabase
        .from('social_media_links')
        .upsert(validLinks, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Social media links updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error saving links',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Heading size="md">Social Media Links</Heading>
        
        {socialLinks.map((link, index) => (
          <HStack key={link.id || index} spacing={4}>
            <FormControl>
              <FormLabel>Platform</FormLabel>
              <Input
                value={link.platform}
                onChange={(e) => handleChange(index, 'platform', e.target.value)}
                placeholder="e.g., Instagram, Facebook"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>URL</FormLabel>
              <Input
                value={link.url}
                onChange={(e) => handleChange(index, 'url', e.target.value)}
                placeholder="https://"
              />
            </FormControl>
            
            <IconButton
              icon={<FaTrash />}
              onClick={() => handleRemoveLink(index)}
              aria-label="Remove link"
              alignSelf="flex-end"
              mb={1}
            />
          </HStack>
        ))}
        
        <Button
          leftIcon={<FaPlus />}
          onClick={handleAddLink}
          size="sm"
          alignSelf="flex-start"
        >
          Add Link
        </Button>
        
        <Button
          colorScheme="blue"
          onClick={handleSave}
          isLoading={isLoading}
          mt={4}
        >
          Save Changes
        </Button>
      </VStack>
    </Box>
  );
};

export default SocialMediaEditor;