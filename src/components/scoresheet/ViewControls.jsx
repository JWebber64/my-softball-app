import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown,
  FaColumns,
  FaImage,
  FaLayerGroup,
  FaPencilAlt,
  FaTable
} from 'react-icons/fa';

/**
 * ViewControls - Consolidated component for view and navigation controls
 * 
 * This component combines functionality from ViewControls and NavigationControls
 */
const ViewControls = ({
  viewMode,
  onViewModeChange,
  canNavigate = false,
  currentGame = 0,
  totalGames = 0,
  onGameChange = null,
  additionalControls = null
}) => {
  const handleViewModeChange = (mode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handlePreviousGame = () => {
    if (onGameChange && currentGame > 1) {
      onGameChange(currentGame - 1);
    }
  };

  const handleNextGame = () => {
    if (onGameChange && currentGame < totalGames) {
      onGameChange(currentGame + 1);
    }
  };

  return (
    <Flex justify="space-between" align="center" mb={4}>
      {/* View Mode Controls */}
      <ButtonGroup isAttached variant="outline" size="sm">
        <Tooltip label="Digital Scoresheet">
          <IconButton
            icon={<FaTable />}
            aria-label="Digital view"
            isActive={viewMode === 'digital-only'}
            onClick={() => handleViewModeChange('digital-only')}
            colorScheme={viewMode === 'digital-only' ? 'green' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Original Image">
          <IconButton
            icon={<FaImage />}
            aria-label="Image view"
            isActive={viewMode === 'image-only'}
            onClick={() => handleViewModeChange('image-only')}
            colorScheme={viewMode === 'image-only' ? 'green' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Side by Side View">
          <IconButton
            icon={<FaColumns />}
            aria-label="Side by side view"
            isActive={viewMode === 'side-by-side'}
            onClick={() => handleViewModeChange('side-by-side')}
            colorScheme={viewMode === 'side-by-side' ? 'green' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Overlay View">
          <IconButton
            icon={<FaLayerGroup />}
            aria-label="Overlay view"
            isActive={viewMode === 'overlay'}
            onClick={() => handleViewModeChange('overlay')}
            colorScheme={viewMode === 'overlay' ? 'green' : 'gray'}
          />
        </Tooltip>
        <Tooltip label="Edit Mode">
          <IconButton
            icon={<FaPencilAlt />}
            aria-label="Edit mode"
            isActive={viewMode === 'edit'}
            onClick={() => handleViewModeChange('edit')}
            colorScheme={viewMode === 'edit' ? 'green' : 'gray'}
          />
        </Tooltip>
      </ButtonGroup>

      {/* Navigation Controls */}
      {canNavigate && (
        <Box>
          <ButtonGroup isAttached variant="outline" size="sm">
            <Tooltip label="Previous Game">
              <IconButton
                icon={<FaArrowLeft />}
                aria-label="Previous game"
                isDisabled={currentGame <= 1}
                onClick={handlePreviousGame}
              />
            </Tooltip>
            
            <Menu>
              <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm">
                Game {currentGame} of {totalGames}
              </MenuButton>
              <MenuList>
                {[...Array(totalGames)].map((_, index) => (
                  <MenuItem 
                    key={index} 
                    onClick={() => onGameChange(index + 1)}
                    fontWeight={currentGame === index + 1 ? 'bold' : 'normal'}
                  >
                    Game {index + 1}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            
            <Tooltip label="Next Game">
              <IconButton
                icon={<FaArrowRight />}
                aria-label="Next game"
                isDisabled={currentGame >= totalGames}
                onClick={handleNextGame}
              />
            </Tooltip>
          </ButtonGroup>
        </Box>
      )}

      {/* Additional Controls */}
      {additionalControls && (
        <Box>
          {additionalControls}
        </Box>
      )}
    </Flex>
  );
};

ViewControls.propTypes = {
  viewMode: PropTypes.oneOf(['digital-only', 'image-only', 'side-by-side', 'overlay', 'edit']),
  onViewModeChange: PropTypes.func
};

export default ViewControls;



