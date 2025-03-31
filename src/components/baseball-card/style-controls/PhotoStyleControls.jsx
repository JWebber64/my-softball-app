import {
  FormControl,
  FormLabel,
  Select,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { formFieldStyles } from '../../../styles/formFieldStyles';

const PhotoStyleControls = ({ style, onChange }) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel color="var(--app-text)">Frame Style</FormLabel>
        <Select
          value={style.frame}
          onChange={(e) => onChange({ frame: e.target.value })}
          {...formFieldStyles}
        >
          <option value="standard">Standard</option>
          <option value="cutout">Cutout</option>
          <option value="floating">Floating</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel color="var(--app-text)">Photo Effect</FormLabel>
        <Select
          value={style.effect}
          onChange={(e) => onChange({ effect: e.target.value })}
          {...formFieldStyles}
        >
          <option value="none">None</option>
          <option value="spotlight">Spotlight</option>
          <option value="vignette">Vignette</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel color="var(--app-text)">Filter</FormLabel>
        <Select
          value={style.filter}
          onChange={(e) => onChange({ filter: e.target.value })}
          {...formFieldStyles}
        >
          <option value="none">None</option>
          <option value="vintage">Vintage</option>
          <option value="dramatic">Dramatic</option>
        </Select>
      </FormControl>
    </VStack>
  );
};

export default PhotoStyleControls;
