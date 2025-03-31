import { AddIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { formFieldStyles } from '../../styles/formFieldStyles';

const PLATFORMS = {
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  YOUTUBE: 'YouTube',
  X: 'X',
  TIKTOK: 'TikTok'
};

const PLATFORM_PATTERNS = {
  [PLATFORMS.INSTAGRAM]: /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
  [PLATFORMS.FACEBOOK]: /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_.]+\/?$/,
  [PLATFORMS.YOUTUBE]: /^https:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?[a-zA-Z0-9_-]+\/?$/,
  [PLATFORMS.X]: /^https:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/,
  [PLATFORMS.TIKTOK]: /^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/
};

const SocialMediaEditor = ({ teamId, isDisabled }) => {
  const { team } = useTeam();
  const [socialLinks, setSocialLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    platform: PLATFORMS.INSTAGRAM,
    link: ''
  });
  const toast = useToast();

  useEffect(() => {
    if (teamId) {
      fetchSocialLinks();
    }
  }, [teamId]);

  const fetchSocialLinks = async () => {
    if (!teamId) return;

    try {
      const { data, error } = await supabase
        .from('team_social_config')
        .select('social_links')
        .eq('team_id', teamId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setSocialLinks(data?.social_links || []);
    } catch (error) {
      toast({
        title: 'Error fetching social links',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  const validateLink = (platform, link) => {
    const pattern = PLATFORM_PATTERNS[platform];
    if (!pattern.test(link)) {
      throw new Error(`Invalid ${platform} URL format`);
    }
  };

  const handleSubmit = async () => {
    try {
      validateLink(formData.platform, formData.link);

      const newLink = {
        id: editingLink?.id || Date.now(),
        platform: formData.platform,
        link: formData.link
      };

      let updatedLinks;
      if (editingLink) {
        updatedLinks = socialLinks.map(link => 
          link.id === editingLink.id ? newLink : link
        );
      } else {
        updatedLinks = [...socialLinks, newLink];
      }

      const { error } = await supabase
        .from('team_social_config')
        .upsert({
          team_id: teamId,
          social_links: updatedLinks
        }, {
          onConflict: 'team_id'
        });

      if (error) throw error;

      setSocialLinks(updatedLinks);
      setFormData({ platform: PLATFORMS.INSTAGRAM, link: '' });
      setEditingLink(null);

      toast({
        title: `Social link ${editingLink ? 'updated' : 'added'} successfully`,
        status: 'success',
        duration: 2000
      });
    } catch (error) {
      toast({
        title: 'Error saving social link',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      link: link.link
    });
  };

  const handleDelete = async (id) => {
    try {
      const updatedLinks = socialLinks.filter(link => link.id !== id);

      const { error } = await supabase
        .from('team_social_config')
        .upsert({
          team_id: teamId,
          social_links: updatedLinks
        }, {
          onConflict: 'team_id'
        });

      if (error) throw error;

      setSocialLinks(updatedLinks);
      toast({
        title: 'Social link deleted successfully',
        status: 'success',
        duration: 2000
      });
    } catch (error) {
      toast({
        title: 'Error deleting social link',
        description: error.message,
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Platform</FormLabel>
          <Select
            {...formFieldStyles}
            value={formData.platform}
            onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
          >
            {Object.values(PLATFORMS).map(platform => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Link</FormLabel>
          <Input
            {...formFieldStyles}
            type="url"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
            placeholder={`Enter ${formData.platform} profile URL`}
          />
        </FormControl>

        <Button
          leftIcon={editingLink ? <EditIcon /> : <AddIcon />}
          onClick={handleSubmit}
          colorScheme="brand"
        >
          {editingLink ? 'Update' : 'Add'} Social Link
        </Button>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Platform</Th>
                <Th>Link</Th>
              </Tr>
            </Thead>
            <Tbody>
              {socialLinks.map((link) => (
                <Tr key={link.id}>
                  <Td>{link.platform}</Td>
                  <Td>{link.link}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

SocialMediaEditor.propTypes = {
  teamId: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool
};

export default SocialMediaEditor;




