import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
  Textarea,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { dialogStyles } from '../../styles/dialogStyles';

const PLATFORMS = {
  X: 'X'
};

const SocialEmbedEditor = ({ teamId, isDisabled, buttonProps }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: PLATFORMS.X,
    embedCode: '',
    displayOrder: 1
  });

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

  // Disable the form if no teamId is provided
  const isFormDisabled = isDisabled || !teamId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('social_embeds')
        .insert({
          team_id: teamId,
          platform: formData.platform,
          embed_code: formData.embedCode,
          display_order: formData.displayOrder
        });

      if (error) throw error;

      setFormData({
        platform: PLATFORMS.X,
        embedCode: '',
        displayOrder: 1
      });

      onClose();

      toast({
        title: "Success",
        description: "Social media embed added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add social media embed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        {...buttonProps?.primary}
        onClick={onOpen}
        isDisabled={isDisabled}
        mb={4}
      >
        Add Embed
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay {...dialogStyles.overlay} />
        <ModalContent {...dialogStyles.content}>
          <ModalHeader {...dialogStyles.header}>
            Add Social Embed
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
                  {Object.values(PLATFORMS).map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4} isRequired>
                <FormLabel color="brand.text.primary">Embed Code</FormLabel>
                <Textarea
                  {...customFormFieldStyles}
                  name="embedCode"
                  value={formData.embedCode}
                  onChange={handleChange}
                  placeholder="Paste embed code here"
                  minHeight="150px"
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel color="brand.text.primary">Display Order</FormLabel>
                <NumberInput
                  min={1}
                  max={10}
                  value={formData.displayOrder}
                  onChange={(valueString) => handleChange({ target: { name: 'displayOrder', value: valueString } })}
                >
                  <NumberInputField {...customFormFieldStyles} />
                </NumberInput>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              {...buttonProps.primary}
              mr="auto"
              onClick={handleSubmit}
              isLoading={isLoading}
              isDisabled={!formData.platform || !formData.embedCode}
            >
              Add Embed
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

SocialEmbedEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool,
  buttonProps: PropTypes.shape({
    primary: PropTypes.object,
    secondary: PropTypes.object
  })
};

export default SocialEmbedEditor;



























