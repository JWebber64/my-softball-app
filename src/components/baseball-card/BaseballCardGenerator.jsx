
import {
  Box,
  Button,
  FormControl,
  Grid,
  GridItem,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MEDIA_CONFIG } from '../../config';
import { CARD_STYLE_PRESETS } from '../../config/baseballCardPresets';
import { STORAGE_BUCKETS } from '../../constants/storage';
import { useAuth } from '../../hooks/useAuth';
import { useBaseballCard } from '../../hooks/useBaseballCard';
import { supabase } from '../../lib/supabaseClient';
import BaseballCard from './BaseballCard';
import CardStyleControls from './CardStyleControls';

const BaseballCardGenerator = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    frontImage,
    backImage,
    setFrontImage,
    setBackImage,
    isFlipped,
    handleFlip,
    isLoading
  } = useBaseballCard(userId);
  
  const [selectedPreset, setSelectedPreset] = useState('MODERN');
  const [customStyle, setCustomStyle] = useState(CARD_STYLE_PRESETS.MODERN);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFrontImage, setIsFrontImage] = useState(true);
  
  const imgRef = useRef(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const toast = useToast();

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    setCustomStyle(CARD_STYLE_PRESETS[presetKey]);
  };

  const handleStyleChange = (newStyle) => {
    setCustomStyle(newStyle);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    
    // Set an initial crop that's centered but doesn't enforce aspect ratio
    setCrop({
      unit: 'px',
      x: width * 0.1,
      y: height * 0.1,
      width: width * 0.8,
      height: height * 0.8,
    });
  };

  const onSelectFile = (event, isFront) => {
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

    setSelectedFile(file);
    setIsFrontImage(isFront);
    
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result.toString());
      setIsModalOpen(true);
      setCrop(null); // Reset crop when new image is selected
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

  const uploadImage = async () => {
    if (!completedCrop?.width || !completedCrop?.height) return;

    setIsUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      const croppedImageFile = new File([croppedImageBlob], selectedFile.name, {
        type: selectedFile.type,
      });

      const fileName = `baseball-card-${userId}-${isFrontImage ? 'front' : 'back'}-${Date.now()}.${selectedFile.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.BASEBALL_CARDS)
        .upload(fileName, croppedImageFile, {
          cacheControl: 'no-cache',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.BASEBALL_CARDS)
        .getPublicUrl(uploadData.path);

      if (isFrontImage) {
        setFrontImage(publicUrl);
      } else {
        setBackImage(publicUrl);
      }

      setIsModalOpen(false);
      toast({
        title: 'Image uploaded successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const modalStyles = {
    bg: 'brand.surface.base',
    borderColor: 'brand.border',
    color: 'brand.text.primary'
  };

  const cropperStyles = {
    '& .ReactCrop__crop-selection': {
      borderColor: 'brand.primary.base',
      color: 'brand.text.primary'
    }
  };

  const formStyles = {
    '& input': {
      bg: 'brand.surface.base',
      color: 'brand.text.primary',
      borderColor: 'brand.border',
      _hover: { borderColor: 'brand.primary.hover' },
      _focus: { borderColor: 'brand.primary.base' }
    },
    '& label': {
      color: 'brand.text.primary'
    }
  };

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "400px 1fr" }}
      gap={8}
      w="100%"
      alignItems="start"
    >
      {/* Left Column - Controls */}
      <GridItem>
        <VStack spacing={6} align="stretch" position="sticky" top="20px">
          <VStack spacing={4}>
            <FormControl>
              <Input
                ref={frontInputRef}
                type="file"
                accept={MEDIA_CONFIG.ALLOWED_TYPES.IMAGES.join(',')}
                onChange={(e) => onSelectFile(e, true)}
                hidden
              />
              <Button
                onClick={() => frontInputRef.current?.click()}
                w="100%"
                bgGradient="linear(to-r, var(--app-gradient-start), var(--app-gradient-middle), var(--app-gradient-end))"
                color="var(--app-text)"
                _hover={{ opacity: 0.8 }}
              >
                {frontImage ? 'Change Front Image' : 'Upload Front Image'}
              </Button>
            </FormControl>

            <FormControl>
              <Input
                ref={backInputRef}
                type="file"
                accept={MEDIA_CONFIG.ALLOWED_TYPES.IMAGES.join(',')}
                onChange={(e) => onSelectFile(e, false)}
                hidden
              />
              <Button
                onClick={() => backInputRef.current?.click()}
                w="100%"
                bgGradient="linear(to-r, var(--app-gradient-start), var(--app-gradient-middle), var(--app-gradient-end))"
                color="var(--app-text)"
                _hover={{ opacity: 0.8 }}
              >
                {backImage ? 'Change Back Image' : 'Upload Back Image'}
              </Button>
            </FormControl>
          </VStack>

          <CardStyleControls
            selectedPreset={selectedPreset}
            onPresetChange={handlePresetChange}
            onStyleChange={handleStyleChange}
            currentStyle={customStyle}
          />
        </VStack>
      </GridItem>

      {/* Right Column - Card Display */}
      <GridItem>
        <VStack spacing={4} align="center">
          <Box
            display="flex"
            justifyContent="center"
            w="100%"
            maxW="600px"
            mx="auto"
          >
            <BaseballCard
              frontImage={frontImage}
              backImage={backImage}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              customStyle={customStyle}
              playerStats={{
                avg: 0.325,
                hr: 42,
                rbi: 128,
                // Add other stats as needed
              }}
              playerName="John Doe" // This should come from your player data
              position="Pitcher"
              teamName="Rangers"
              jerseyNumber="42"
              season="2024"
              cardNumber="123"
              isParallel={false}
              rarityLevel="common"
              teamLogo="/path/to/logo.png" // Add your team logo path
            />
          </Box>
          <Text fontSize="sm" color="gray.500">
            Click the card to flip it
          </Text>
        </VStack>
      </GridItem>

      {/* Cropping Modal */}
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
        <ModalContent sx={modalStyles}>
          <ModalHeader color="brand.text.primary">
            Crop Image
          </ModalHeader>
          <ModalBody>
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                // Remove the aspect={1} prop to allow free-form cropping
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
              onClick={uploadImage}
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
    </Grid>
  );
};

export default BaseballCardGenerator;








