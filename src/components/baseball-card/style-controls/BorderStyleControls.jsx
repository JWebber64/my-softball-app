import {
  FormControl,
  FormLabel,
  Select,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { formFieldStyles } from '../../../styles/formFieldStyles';

const BorderStyleControls = ({ style, onChange }) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel color="var(--app-text)">Border Type</FormLabel>
        <Select
          value={style.type}
          onChange={(e) => onChange({ type: e.target.value })}
          {...formFieldStyles}
        >
          <option value="straight">Straight</option>
          <option value="rounded">Rounded</option>
          <option value="beveled">Beveled</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel color="var(--app-text)">Border Effect</FormLabel>
        <Select
          value={style.effect}
          onChange={(e) => onChange({ effect: e.target.value })}
          {...formFieldStyles}
        >
          <option value="none">None</option>
          <option value="holographic">Holographic</option>
          <option value="metallic">Metallic</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel color="var(--app-text)">Border Color</FormLabel>
        <Select
          value={style.color}
          onChange={(e) => onChange({ color: e.target.value })}
          {...formFieldStyles}
        >
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="bronze">Bronze</option>
        </Select>
      </FormControl>
    </VStack>
  );
};

export default BorderStyleControls;
