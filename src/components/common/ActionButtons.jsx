import { HStack, IconButton, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

/**
 * Reusable component for edit/delete action buttons
 */
const ActionButtons = ({ 
  onEdit, 
  onDelete, 
  editLabel = "Edit", 
  deleteLabel = "Delete",
  skipDeleteConfirmation = false,
  size = "sm",
  isDisabled = false
}) => {
  const handleDelete = () => {
    if (skipDeleteConfirmation || window.confirm('Are you sure you want to delete this item?')) {
      onDelete();
    }
  };

  return (
    <HStack spacing={2}>
      {onEdit && (
        <Tooltip label={editLabel}>
          <IconButton
            icon={<FaEdit />}
            size={size}
            variant="primary"
            className="app-gradient"
            color="brand.text.primary"
            _hover={{ opacity: 0.9 }}
            onClick={onEdit}
            aria-label={editLabel}
            isDisabled={isDisabled}
          />
        </Tooltip>
      )}
      
      {onDelete && (
        <Tooltip label={deleteLabel}>
          <IconButton
            icon={<FaTrash />}
            size={size}
            variant="delete"
            bg="brand.button.delete"
            color="brand.text.primary"
            _hover={{ bg: "brand.button.deleteHover" }}
            onClick={handleDelete}
            aria-label={deleteLabel}
            isDisabled={isDisabled}
          />
        </Tooltip>
      )}
    </HStack>
  );
};

export default ActionButtons;






