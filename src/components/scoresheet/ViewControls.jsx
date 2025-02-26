import React from 'react';
import {
  ButtonGroup,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { MdViewSidebar, MdViewDay, MdImage } from 'react-icons/md';

const ViewControls = ({ viewMode, onViewModeChange }) => {
  return (
    <ButtonGroup>
      <Tooltip label="Side by Side View">
        <IconButton
          icon={<MdViewSidebar />}
          isActive={viewMode === 'side-by-side'}
          onClick={() => onViewModeChange('side-by-side')}
          aria-label="Side by side view"
          bg="#545E46"
          color="#EFF7EC"
          _hover={{ bg: "#6b7660" }}
          _active={{ bg: "#3a4531" }}
        />
      </Tooltip>
      <Tooltip label="Overlay View">
        <IconButton
          icon={<MdViewDay />}
          isActive={viewMode === 'overlay'}
          onClick={() => onViewModeChange('overlay')}
          aria-label="Overlay view"
          bg="#545E46"
          color="#EFF7EC"
          _hover={{ bg: "#6b7660" }}
          _active={{ bg: "#3a4531" }}
        />
      </Tooltip>
      <Tooltip label="Image Only">
        <IconButton
          icon={<MdImage />}
          isActive={viewMode === 'image-only'}
          onClick={() => onViewModeChange('image-only')}
          aria-label="Image only view"
          bg="#545E46"
          color="#EFF7EC"
          _hover={{ bg: "#6b7660" }}
          _active={{ bg: "#3a4531" }}
        />
      </Tooltip>
    </ButtonGroup>
  );
};

export default ViewControls;
