import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from '@chakra-ui/react';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search...', 
  debounceMs = 300,
  initialValue = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.300" />
      </InputLeftElement>
      <Input
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        borderRadius="md"
        bg="white"
        _hover={{ borderColor: 'green.400' }}
        _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px var(--chakra-colors-green-500)' }}
      />
      {searchTerm && (
        <InputRightElement>
          <IconButton
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            onClick={handleClear}
            aria-label="Clear search"
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  initialValue: PropTypes.string
};

SearchBar.defaultProps = {
  placeholder: 'Search...',
  debounceMs: 300,
  initialValue: ''
};

export default SearchBar;