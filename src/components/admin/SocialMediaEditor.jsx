import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabaseClient';
import { dialogStyles } from '../../styles/dialogStyles';

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

const SocialMediaEditor = ({ teamId = '', isDisabled = false, buttonProps = {} }) => {
  const { team } = useTeam();
  const [socialLinks, setSocialLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    platform: PLATFORMS.INSTAGRAM,
    link: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Add the missing handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (teamId) {
      fetchSocialLinks();
    }
  }, [teamId]);

  const fetchSocialLinks = async () => {
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

  const handleSubmit = async () => {
    try {
      const pattern = PLATFORM_PATTERNS[formData.platform];
      if (!pattern.test(formData.link)) {
        throw new Error(`Invalid ${formData.platform} URL format`);
      }

      const newLink = {
        id: editingLink?.id || Date.now(),
        platform: formData.platform,
        link: formData.link
      };

      const updatedLinks = editingLink
        ? socialLinks.map(link => link.id === editingLink.id ? newLink : link)
        : [...socialLinks, newLink];

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
      onClose();

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

  // Add the customFormFieldStyles
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

  return (
    <>
      <Button
        onClick={onOpen}
        isDisabled={isDisabled}
        mb={4}
        {...buttonProps.primary}
      >
        Add Social Link
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Platform</Th>
            <Th>Link</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {socialLinks.map((link) => (
            <Tr key={link.id}>
              <Td>{link.platform}</Td>
              <Td>{link.link}</Td>
              <Td>
                <Button
                  onClick={() => handleDelete(link.id)}
                  size="sm"
                  {...buttonProps.secondary}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay {...dialogStyles.overlay} />
        <ModalContent {...dialogStyles.content}>
          <ModalHeader {...dialogStyles.header}>
            {editingLink ? 'Edit Social Link' : 'Add Social Link'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody {...dialogStyles.body}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="brand.text.primary">Platform</FormLabel>
                <Select
                  {...customFormFieldStyles}
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                >
                  {Object.keys(PLATFORM_PATTERNS).map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4} isRequired>
                <FormLabel color="brand.text.primary">Link</FormLabel>
                <Input
                  {...customFormFieldStyles}
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder={`Enter ${formData.platform} URL`}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter {...dialogStyles.footer}>
            <Button
              variant="primary"
              className="app-gradient"
              color="brand.text.primary"
              _hover={{ opacity: 0.9 }}
              mr="auto"
              onClick={handleSubmit}
              isLoading={isLoading}
              isDisabled={!formData.platform || !formData.link}
            >
              {editingLink ? 'Update Link' : 'Add Link'}
            </Button>
            <Button variant="cancel" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

SocialMediaEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool,
  buttonProps: PropTypes.shape({
    primary: PropTypes.object,
    secondary: PropTypes.object
  })
};

export default SocialMediaEditor;





