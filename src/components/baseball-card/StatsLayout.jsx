import { Box, Grid, Text, Divider } from '@chakra-ui/react';
import React from 'react';
import { STATS_LAYOUTS, STAT_DISPLAY_CONFIG } from '../../config/baseballCardPresets';

const formatStat = (value, format) => {
  if (format === '.000') {
    return value.toFixed(3);
  }
  return value.toString();
};

const StatsLayout = ({ stats, layout = 'traditional', showDividers = true }) => {
  const layoutConfig = STATS_LAYOUTS[layout];
  
  return (
    <Box w="100%" p={2}>
      <Grid
        templateColumns={layoutConfig.grid}
        gap={layoutConfig.spacing}
        w="100%"
      >
        {layoutConfig.statOrder.map((statKey, index) => {
          const stat = stats[statKey];
          const config = STAT_DISPLAY_CONFIG[statKey];
          
          if (!stat || !config) return null;

          return (
            <React.Fragment key={statKey}>
              <Box 
                textAlign="center"
                p={1}
                position="relative"
              >
                <Text
                  fontSize="xs"
                  color="gray.600"
                  fontWeight="medium"
                >
                  {config.label}
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                >
                  {formatStat(stat, config.format)}
                </Text>
                {showDividers && layoutConfig.dividerStyle !== 'none' && index < layoutConfig.statOrder.length - 1 && (
                  <Divider
                    orientation={layout === 'traditional' ? 'horizontal' : 'vertical'}
                    position="absolute"
                    right={layout === 'traditional' ? '0' : '-1px'}
                    top={layout === 'traditional' ? 'auto' : '0'}
                    bottom={layout === 'traditional' ? '-1px' : '0'}
                    borderStyle={layoutConfig.dividerStyle}
                  />
                )}
              </Box>
            </React.Fragment>
          );
        })}
      </Grid>
    </Box>
  );
};

export default StatsLayout;