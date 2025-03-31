import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  HStack,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import FilterGroup from './FilterGroup';

const FilterBar = ({
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleFilterChange = (filterKey, values) => {
    onFilterChange(filterKey, values);
  };

  const renderFilterGroups = () => (
    filters.map(filter => (
      <FilterGroup
        key={filter.key}
        title={filter.title}
        type={filter.type}
        options={filter.options}
        selected={selectedFilters[filter.key] || []}
        onChange={(values) => handleFilterChange(filter.key, values)}
      />
    ))
  );

  if (isMobile) {
    return (
      <>
        <Button
          leftIcon={<HamburgerIcon />}
          onClick={onToggle}
          colorScheme="green"
          variant="outline"
          size="sm"
        >
          Filters
        </Button>

        <Collapse in={isOpen} animateOpacity>
          <Box>
            {renderFilterGroups()}
            <Button
              mt={4}
              w="full"
              colorScheme="red"
              variant="outline"
              onClick={onClearAll}
            >
              Clear All
            </Button>
          </Box>
        </Collapse>
      </>
    );
  }

  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm">
      <HStack spacing={8} align="start">
        {renderFilterGroups()}
        <Button
          colorScheme="red"
          variant="outline"
          size="sm"
          onClick={onClearAll}
        >
          Clear All
        </Button>
      </HStack>
    </Box>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.array.isRequired,
  selectedFilters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired
};

export default FilterBar;

