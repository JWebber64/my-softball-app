import React from 'react';
import PropTypes from 'prop-types';
import {
  Wrap,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
  Text
} from '@chakra-ui/react';

const FilterBadges = ({
  filters,
  selectedFilters,
  onRemoveFilter
}) => {
  const getSelectedOptions = (filterKey) => {
    const filter = filters.find(f => f.key === filterKey);
    if (!filter) return [];

    return selectedFilters[filterKey]
      .map(value => {
        const option = filter.options.find(opt => opt.value === value);
        return option ? option.label : value;
      });
  };

  const hasFilters = Object.values(selectedFilters).some(values => values.length > 0);

  if (!hasFilters) {
    return (
      <Box py={2}>
        <Text color="gray.500" fontSize="sm">No active filters</Text>
      </Box>
    );
  }

  return (
    <Wrap spacing={2} py={2}>
      {Object.entries(selectedFilters).map(([filterKey, values]) => {
        if (!values || values.length === 0) return null;

        const labels = getSelectedOptions(filterKey);
        return labels.map(label => (
          <Tag
            key={`${filterKey}-${label}`}
            size="md"
            borderRadius="full"
            variant="subtle"
            colorScheme="green"
          >
            <TagLabel>{label}</TagLabel>
            <TagCloseButton
              onClick={() => onRemoveFilter(filterKey, label)}
            />
          </Tag>
        ));
      })}
    </Wrap>
  );
};

FilterBadges.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ).isRequired,
  selectedFilters: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.string)
  ).isRequired,
  onRemoveFilter: PropTypes.func.isRequired
};

export default FilterBadges;