import {
  Box,
  FormControl,
  FormLabel,
  Select
} from '@chakra-ui/react';
import React from 'react';
import { formFieldStyles } from '../../styles/formFieldStyles';

const LeagueSelector = ({ 
  leagues, 
  selectedLeagueId, 
  onChange, 
  showAllOption = true,
  label = "Select League" 
}) => {
  return (
    <Box mb={4}>
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Select 
          value={selectedLeagueId || ''} 
          onChange={(e) => onChange(e.target.value === 'all' ? null : e.target.value)}
          {...formFieldStyles}
        >
          {showAllOption && (
            <option value="all">All Leagues (Total)</option>
          )}
          {leagues?.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LeagueSelector;
