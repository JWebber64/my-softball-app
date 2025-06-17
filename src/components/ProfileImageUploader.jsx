import {
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MEDIA_CONFIG } from '../config';
import { STORAGE_BUCKETS } from '../constants/storage';
import { supabase } from '../lib/supabaseClient';

const ProfileImageUploader = ({ userId, currentImageUrl, onImageUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState(null); // Initialize as null instead of empty object
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  if (!userId) {
    console.warn('ProfileImageUploader: No userId provided');
    return null;
  }

  // Add this function to set initial crop when image loads
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidth = Math.min(width, height);
    const x = (width - cropWidth) / 2;
    const y = (height - cropWidth) / 2;

    setCrop({
      unit: 'px',
      x,
      y,
      width: cropWidth,
      height: cropWidth,
    });
  };

  const onSelectFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!MEDIA_CONFIG.ALLOWED_TYPES.IMAGES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, or JPEG)',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result.toString());
      setIsModalOpen(true);
      // Reset crop when new image is selected
      setCrop(null);
      setCompletedCrop(null);
    });
    reader.readAsDataURL(file);
  };

  const getCroppedImg = async (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, selectedFile.type);
    });
  };

  const uploadProfileImage = async () => {
    if (!completedCrop?.width || !completedCrop?.height) {
      return;
    }

    setIsUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      const croppedImageFile = new File([croppedImageBlob], selectedFile.name, {
        type: selectedFile.type,
      });

      // Generate a unique filename
      const timestamp = Date.now();
      const fileName = `profile_${userId}_${timestamp}.${selectedFile.name.split('.').pop()}`;
      
      // Upload the new image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.PROFILE_PICTURES)
        .upload(fileName, croppedImageFile, {
          cacheControl: 'no-cache',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.PROFILE_PICTURES)
        .getPublicUrl(uploadData.path);

      console.log('New image uploaded:', publicUrl);

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('profile_user_id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('player_profiles')
          .update({ 
            profile_image_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('profile_user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Create new profile using userId as both id and profile_user_id
        const { error: insertError } = await supabase
          .from('player_profiles')
          .insert({
            id: userId,  // Use userId as the primary key
            profile_user_id: userId,
            profile_image_url: publicUrl,
            is_public: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      console.log('Profile updated with new image URL');

      // Delete the old image if it exists
      if (currentImageUrl) {
        const oldFileName = currentImageUrl.split('/').pop().split('?')[0];
        try {
          await supabase.storage
            .from(STORAGE_BUCKETS.PROFILE_PICTURES)
            .remove([oldFileName]);
          console.log('Old image deleted:', oldFileName);
        } catch (err) {
          console.warn('Failed to delete old image:', err);
        }
      }

      console.log('About to call onImageUpdate with URL:', publicUrl);
      onImageUpdate(publicUrl);
      
      setIsModalOpen(false);
      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been successfully updated.',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      toast({
        title: 'Failed to update profile picture',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <VStack spacing={4} width="full">
      <FormControl>
        <Input
          ref={fileInputRef}
          type="file"
          accept={MEDIA_CONFIG.ALLOWED_TYPES.IMAGES.join(',')}
          onChange={onSelectFile}
          hidden
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          w={{ base: "80%", md: "200px" }}  // Narrower width, responsive
          size="sm"
          bgGradient="linear(to-r, brand.gradient.start, brand.gradient.middle, brand.gradient.end)"
          color="brand.text.primary"
          _hover={{
            opacity: 0.9
          }}
          mx="auto"  // Center the button
        >
          {currentImageUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}
        </Button>
      </FormControl>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setCrop(null);
          setCompletedCrop(null);
        }} 
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crop Profile Picture</ModalHeader>
          <ModalBody>
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ maxWidth: '100%' }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={uploadProfileImage}
              isLoading={isUploading}
              isDisabled={!completedCrop?.width || !completedCrop?.height}
            >
              Save
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsModalOpen(false);
                setCrop(null);
                setCompletedCrop(null);
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

ProfileImageUploader.propTypes = {
  userId: PropTypes.string.isRequired,
  currentImageUrl: PropTypes.string,
  onImageUpdate: PropTypes.func.isRequired
};

export default ProfileImageUploader;












