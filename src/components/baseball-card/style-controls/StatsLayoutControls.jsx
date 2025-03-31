import {
  FormControl,
  FormLabel,
  Select,
  Switch,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { STATS_LAYOUTS } from '../../../config/baseballCardPresets';
import { formFieldStyles } from '../../../styles/formFieldStyles';

const StatsLayoutControls = ({ style, onChange }) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel color="var(--app-text)">Layout Type</FormLabel>
        <Select
          value={style.type}
          onChange={(e) => onChange({ type: e.target.value })}
          {...formFieldStyles}
        >
          {Object.values(STATS_LAYOUTS).map(layout => (
            <option key={layout} value={layout}>
              {layout.charAt(0).toUpperCase() + layout.slice(1)}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <FormLabel color="var(--app-text)" mb="0">
          Show Dividers
        </FormLabel>
        <Switch
          isChecked={style.showDividers}
          onChange={(e) => onChange({ showDividers: e.target.checked })}
          colorScheme="green"
        />
      </FormControl>
    </VStack>
  );
};

export default StatsLayoutControls;
