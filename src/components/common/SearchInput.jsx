import { SearchIcon } from '@chakra-ui/icons';
import {
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  size = 'md',
  variant = 'filled'
}) => {
  const bgColor = useColorModeValue('gray.100', 'whiteAlpha.100');
  const iconColor = useColorModeValue('gray.500', 'whiteAlpha.600');

  return (
    <InputGroup size={size}>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color={iconColor} />
      </InputLeftElement>
      <Input
        {...formFieldStyles}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant={variant}
      />
    </InputGroup>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled'])
};

export default SearchInput;

