import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import React from 'react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  size = 'md'
}) => {
  return (
    <InputGroup size={size}>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        bg="white"
        _hover={{ borderColor: 'green.400' }}
        _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px var(--chakra-colors-green-500)' }}
      />
      {value && (
        <InputRightElement>
          <IconButton
            size="sm"
            icon={<CloseIcon />}
            variant="ghost"
            onClick={() => onChange('')}
            aria-label="Clear search"
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default SearchBar;