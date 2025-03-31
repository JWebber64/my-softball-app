import {
  Box,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const FilterGroup = ({
  title,
  type = 'checkbox',  // Default parameter here instead of defaultProps
  options,
  selected = [],     // Default parameter for selected
  onChange
}) => {
  const handleCheckboxChange = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Box>
      <Text fontWeight="bold" mb={2}>{title}</Text>
      <VStack align="start" spacing={2}>
        {type === 'checkbox' ? (
          <Stack spacing={1}>
            {options.map((option) => (
              <Checkbox
                key={option.value}
                isChecked={selected.includes(option.value)}
                onChange={() => handleCheckboxChange(option.value)}
                colorScheme="green"
              >
                {option.label}
              </Checkbox>
            ))}
          </Stack>
        ) : (
          <RadioGroup value={selected[0]} onChange={(value) => onChange([value])}>
            <Stack spacing={1}>
              {options.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  colorScheme="green"
                >
                  {option.label}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        )}
      </VStack>
    </Box>
  );
};

FilterGroup.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['checkbox', 'radio']),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired
};

export default FilterGroup;
