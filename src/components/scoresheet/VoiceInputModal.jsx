import PropTypes from 'prop-types';
import React from 'react';
import VoiceCommandPanel from './VoiceCommandPanel';

/**
 * VoiceInputModal - Wrapper for backward compatibility
 * 
 * This component uses the consolidated VoiceCommandPanel with isModal=true
 */
const VoiceInputModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  if (!isOpen) return null;
  
  return (
    <VoiceCommandPanel
      isActive={true}
      onToggle={() => {}}
      isModal={true}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    />
  );
};

VoiceInputModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default VoiceInputModal;


