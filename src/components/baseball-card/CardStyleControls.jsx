import {
  Box,
  Divider,
  Heading,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { CARD_STYLE_PRESETS } from '../../config/baseballCardPresets';
import { formFieldStyles } from '../../styles/formFieldStyles';
import BackgroundStyleControls from './style-controls/BackgroundStyleControls';
import BorderStyleControls from './style-controls/BorderStyleControls';
import PhotoStyleControls from './style-controls/PhotoStyleControls';
import StatsLayoutControls from './style-controls/StatsLayoutControls';

const CardStyleControls = ({
  selectedPreset,
  onPresetChange,
  onStyleChange,
  currentStyle,
  isMobile
}) => {
  const handleStyleUpdate = (category, updates) => {
    onStyleChange({
      ...currentStyle,
      [category]: {
        ...currentStyle[category],
        ...updates
      }
    });
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Preset Selector */}
      <Box>
        <Heading size="sm" mb={2} color="brand.text.primary">Card Style Preset</Heading>
        <Select
          value={selectedPreset}
          onChange={(e) => onPresetChange(e.target.value)}
          {...formFieldStyles}
        >
          {Object.entries(CARD_STYLE_PRESETS).map(([key, preset]) => (
            <option 
              key={key} 
              value={key}
              style={{ 
                backgroundColor: 'brand.surface.base',
                color: 'brand.text.primary'
              }}
            >
              {preset.name}
            </option>
          ))}
        </Select>
      </Box>

      <Divider />

      {/* Style Controls */}
      <Tabs
        variant="enclosed"
        colorScheme="brand"
        isLazy
        orientation={isMobile ? 'horizontal' : 'vertical'}
      >
        <TabList>
          <Tab>Border</Tab>
          <Tab>Background</Tab>
          <Tab>Stats</Tab>
          <Tab>Photo</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BorderStyleControls
              style={currentStyle.borderStyle}
              onChange={(updates) => handleStyleUpdate('borderStyle', updates)}
            />
          </TabPanel>

          <TabPanel>
            <BackgroundStyleControls
              style={currentStyle.backgroundStyle}
              onChange={(updates) => handleStyleUpdate('backgroundStyle', updates)}
            />
          </TabPanel>

          <TabPanel>
            <StatsLayoutControls
              style={currentStyle.statsLayout}
              onChange={(updates) => handleStyleUpdate('statsLayout', updates)}
            />
          </TabPanel>

          <TabPanel>
            <PhotoStyleControls
              style={currentStyle.photoStyle}
              onChange={(updates) => handleStyleUpdate('photoStyle', updates)}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default CardStyleControls;



