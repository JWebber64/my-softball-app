import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Image,
  useToast,
  Box,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { supabase, STORAGE_BUCKETS } from '../../lib/supabaseClient';
import { useSimpleAuth } from '../../context/SimpleAuthContext';
import { uploadFile } from '../../utils/supabaseStorage';
import { DEFAULT_IMAGES } from '../../constants/assets';

const TeamDetailsEditor = ({ initialData, onSave }) => {
  const { user, fetchTeamInfo } = useSimpleAuth();
  const [name, setName] = useState(initialData?.name || '');
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.logo_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 2MB",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG, PNG, or GIF file",
          status: "error",
          duration: 3000,
        });
        return;
      }

      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setPreviewUrl(initialData?.logo_url || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logo_url = initialData?.logo_url;

      if (logoFile) {
        try {
          // Delete old logo if it exists
          if (initialData?.logo_url) {
            await cleanupTeamLogo(initialData.logo_url);
          }
          
          // Upload new logo
          logo_url = await uploadFile(logoFile, STORAGE_BUCKETS.TEAM_LOGOS);
        } catch (uploadError) {
          console.error('Logo upload error:', uploadError);
          throw new Error(`Logo upload failed: ${uploadError.message}`);
        }
      }

      const { data, error } = await supabase
        .from('teams')
        .update({ 
          name, 
          logo_url 
        })
        .eq('id', initialData.id)
        .select()
        .single();

      if (error) throw error;

      await fetchTeamInfo();
      onSave(data);
      
      toast({
        title: 'Team updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error updating team',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel htmlFor="team-name">Team Name</FormLabel>
          <Input
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter team name"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="logo-upload">Team Logo</FormLabel>
          <VStack spacing={2} align="stretch">
            <Input
              id="logo-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleLogoChange}
              display="none"
            />
            <Button
              as="label"
              htmlFor="logo-upload"
              cursor="pointer"
              colorScheme="blue"
              size="sm"
            >
              Choose Logo File
            </Button>
            <Text fontSize="sm" color="gray.500">
              Recommended: Square image, max 2MB (JPG, PNG or GIF)
            </Text>
            
            {(previewUrl || logoFile) && (
              <Box 
                mt={2} 
                position="relative" 
                width="fit-content"
                borderRadius="md"
                overflow="hidden"
              >
                <Image
                  src={previewUrl}
                  alt="Team logo preview"
                  maxH="150px"
                  objectFit="contain"
                  fallbackSrc={DEFAULT_IMAGES.TEAM_LOGO}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  position="absolute"
                  top={1}
                  right={1}
                  colorScheme="red"
                  onClick={handleRemoveLogo}
                  aria-label="Remove logo"
                />
              </Box>
            )}
          </VStack>
        </FormControl>

        <Button
          type="submit"
          colorScheme="green"
          isLoading={isLoading}
        >
          Save Changes
        </Button>
      </VStack>
    </form>
  );
};

export default TeamDetailsEditor;
