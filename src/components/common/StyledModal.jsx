import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { dialogStyles } from '../../styles/dialogStyles';

const StyledModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  isCentered = false
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      isCentered={isCentered}
    >
      <ModalOverlay bg="brand.overlay" />
      <ModalContent 
        bg="brand.surface.base" 
        color="brand.text.primary"
        borderColor="brand.border"
      >
        {title && (
          <ModalHeader borderBottomWidth="1px" borderColor="brand.border">
            {title}
          </ModalHeader>
        )}
        <ModalCloseButton />
        <ModalBody>
          {children}
        </ModalBody>
        {footer && (
          <ModalFooter borderTopWidth="1px" borderColor="brand.border">
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

StyledModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.string,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  isCentered: PropTypes.bool
};

export default StyledModal;