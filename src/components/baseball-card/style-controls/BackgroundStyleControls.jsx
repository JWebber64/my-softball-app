import {
  FormControl,
  FormLabel,
  Select,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { formFieldStyles } from '../../../styles/formFieldStyles';

const BackgroundStyleControls = ({ style, onChange }) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel color="brand.text.primary">Pattern</FormLabel>
        <Select
          value={style.pattern}
          onChange={(e) => onChange({ pattern: e.target.value })}
          {...formFieldStyles}
        >
          <option value="pinstripe">Pinstripe</option>
          <option value="gradient">Gradient</option>
          <option value="aged">Aged</option>
          <option value="solid">Solid</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel color="brand.text.primary">Texture</FormLabel>
        <Select
          value={style.texture}
          onChange={(e) => onChange({ texture: e.target.value })}
          {...formFieldStyles}
        >
          <option value="clean">Clean</option>
          <option value="subtle">Subtle</option>
          <option value="paper">Paper</option>
          <option value="rough">Rough</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel color="brand.text.primary">Effect</FormLabel>
        <Select
          value={style.effect}
          onChange={(e) => onChange({ effect: e.target.value })}
          {...formFieldStyles}
        >
          <option value="none">None</option>
          <option value="gradient">Gradient</option>
          <option value="shine">Shine</option>
        </Select>
      </FormControl>
    </VStack>
  );
};

export default BackgroundStyleControls;


