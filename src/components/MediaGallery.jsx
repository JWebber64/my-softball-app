import {
  Box,
  Grid,
  Image,
  AspectRatio,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MediaItem = ({ type, url, title }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  if (type === 'video') {
    return (
      <Box>
        <AspectRatio ratio={16/9}>
          <iframe
            src={url}
            title={title}
            allowFullScreen
            loading="lazy"
          />
        </AspectRatio>
        {title && (
          <Text mt={2} fontSize="sm" color="gray.600">
            {title}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <>
      <LinkBox>
        <AspectRatio ratio={4/3}>
          <LinkOverlay href="#" onClick={onOpen}>
            <Image
              src={url}
              alt={title}
              objectFit="cover"
              borderRadius="md"
              loading="lazy"
            />
          </LinkOverlay>
        </AspectRatio>
        {title && (
          <Text mt={2} fontSize="sm" color="gray.600">
            {title}
          </Text>
        )}
      </LinkBox>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton zIndex="modal" />
          <ModalBody p={0}>
            <Image
              src={url}
              alt={title}
              w="100%"
              h="auto"
              borderRadius="md"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const MediaGallery = ({ data }) => {
  if (!data?.length) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        No media available.
      </Box>
    );
  }

  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)'
      }}
      gap={6}
    >
      {data.map((item) => (
        <Box key={item.id}>
          <MediaItem
            type={item.type}
            url={item.url}
            title={item.title}
          />
        </Box>
      ))}
    </Grid>
  );
};

MediaGallery.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['photo', 'video']).isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.string,
      source: PropTypes.string,
    })
  ).isRequired,
};

MediaItem.propTypes = {
  type: PropTypes.oneOf(['photo', 'video']).isRequired,
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default MediaGallery;