import {
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  VStack,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formFieldStyles } from '../../styles/formFieldStyles';

const PLATFORMS = {
  X: 'X',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok'
};

const SocialEmbedEditor = ({ teamId, isDisabled }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    platform: PLATFORMS.X,
    embedCode: '',
    displayOrder: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

      // Reset form
      setFormData({
        platform: PLATFORMS.X,
        embedCode: '',
        displayOrder: 1
      });

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
    }
  };

  return (
    <VStack 
      as="form" 
      onSubmit={handleSubmit} 
      spacing={4} 
      align="stretch"
      opacity={isDisabled ? 0.6 : 1}
    >
      <FormControl>
        <FormLabel color="brand.text.primary">Platform</FormLabel>
        <Select
          {...formFieldStyles}
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          bg="brand.primary.base"
          color="brand.text.primary"
          borderColor="brand.border"
          _hover={{ borderColor: 'brand.primary.hover' }}
          isDisabled={isDisabled}
        >
          <option value={PLATFORMS.X}>{PLATFORMS.X}</option>
          <option value={PLATFORMS.FACEBOOK}>{PLATFORMS.FACEBOOK}</option>
          <option value={PLATFORMS.INSTAGRAM}>{PLATFORMS.INSTAGRAM}</option>
          <option value={PLATFORMS.YOUTUBE}>{PLATFORMS.YOUTUBE}</option>
          <option value={PLATFORMS.TIKTOK}>{PLATFORMS.TIKTOK}</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel color="brand.text.primary">Embed Code</FormLabel>
        <Input
          {...formFieldStyles}
          name="embedCode"
          value={formData.embedCode}
          onChange={handleChange}
          bg="brand.primary.base"
          color="brand.text.primary"
          borderColor="brand.border"
          _hover={{ borderColor: 'brand.primary.hover' }}
          isDisabled={isDisabled}
          placeholder={`Enter ${formData.platform} embed code`}
        />
      </FormControl>

      <FormControl>
        <FormLabel color="brand.text.primary">Display Order</FormLabel>
        <NumberInput
          name="displayOrder"
          value={formData.displayOrder}
          onChange={(valueString) => handleChange({
            target: { name: 'displayOrder', value: valueString }
          })}
          min={1}
          isDisabled={isDisabled}
        >
          <NumberInputField
            bg="brand.primary.base"
            color="brand.text.primary"
            borderColor="brand.border"
            _hover={{ borderColor: 'brand.primary.hover' }}
          />
        </NumberInput>
      </FormControl>

      <Button
        type="submit"
        // Remove the hardcoded gradient
        // bgGradient="linear(to-r, #111613, #1b2c14, #111613)"
        // color="brand.text.primary"
        // _hover={{ opacity: 0.9 }}
        isDisabled={isDisabled}
      >
        Save Embed
      </Button>
    </VStack>
  );
};

SocialEmbedEditor.propTypes = {
  teamId: PropTypes.string,
  isDisabled: PropTypes.bool
};

export default SocialEmbedEditor;










