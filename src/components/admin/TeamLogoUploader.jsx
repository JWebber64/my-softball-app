import {
  Button,
  FormControl,
  Input,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { MEDIA_CONFIG } from '../../config';
import { STORAGE_BUCKETS } from '../../constants/storage';
import { useTeam } from '../../hooks/useTeam';
import { deleteStorageFile, supabase } from '../../lib/supabaseClient';
import { formFieldStyles } from '../../styles/formFieldStyles';

const TeamLogoUploader = () => {
  const { team, setTeam } = useTeam();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const uploadLogo = async (file) => {
    setIsUploading(true);
    try {
      if (team?.logo_url) {
        const oldFileName = team.logo_url.split('/').pop();
        await deleteStorageFile(STORAGE_BUCKETS.TEAM_LOGOS, oldFileName);
      }

      const fileName = `team-${team.id}-${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.TEAM_LOGOS)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.TEAM_LOGOS)
        .getPublicUrl(uploadData.path);

      const { data, error } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', team.id)
        .select()
        .single();

      if (error) throw error;

      // Update the team context with the new data
      setTeam({
        ...team,
        logo_url: publicUrl
      });

      toast({
        title: 'Logo uploaded successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error uploading logo',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!MEDIA_CONFIG.ALLOWED_TYPES.IMAGES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or GIF file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (file.size > MEDIA_CONFIG.MAX_FILE_SIZE.IMAGES) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    await uploadLogo(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <Input
          ref={fileInputRef}
          type="file"
          accept={MEDIA_CONFIG.ALLOWED_TYPES.IMAGES.join(',')}
          onChange={handleLogoUpload}
          hidden
          {...formFieldStyles}
          id="logo-upload"
        />
        <Button
          onClick={handleButtonClick}
          isLoading={isUploading}
          w="full"
          variant="primary"
        >
          {team?.logo_url ? 'Change Logo' : 'Upload Logo'}
        </Button>
      </FormControl>
    </VStack>
  );
};

export default TeamLogoUploader;







