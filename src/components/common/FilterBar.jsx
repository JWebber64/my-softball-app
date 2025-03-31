import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Icon,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import { FiFilter } from 'react-icons/fi';

const FilterOption = ({ type, label, value, options, onChange, selected }) => {
  if (type === 'select') {
    return (
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={1} color="text">{label}</Text>
        <Select 
          value={selected} 
          onChange={(e) => onChange(e.target.value)}
          size="sm"
          bg="background"
          color="text"
          borderColor="brand.border"
          _hover={{ borderColor: 'brand.primary.hover' }}
          _focus={{ borderColor: 'brand.primary.active' }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Box>
    );
  }

  if (type === 'checkbox') {
    return (
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={1} color="text">{label}</Text>
        <CheckboxGroup value={selected} onChange={onChange}>
          <Stack>
            {options.map((option) => (
              <Checkbox 
                key={option.value} 
                value={option.value}
                colorScheme="brand"
                borderColor="brand.border"
              >
                {option.label}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      </Box>
    );
  }

  if (type === 'radio') {
    return (
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={1} color="text">{label}</Text>
        <RadioGroup value={selected} onChange={onChange}>
          <Stack>
            {options.map((option) => (
              <Radio 
                key={option.value} 
                value={option.value}
                colorScheme="brand"
                borderColor="brand.border"
              >
                {option.label}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      </Box>
    );
  }

  return null;
};

const FilterBar = ({
  filters,
  values,
  onChange,
  onClear,
  showClearButton = true
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleChange = (key, value) => {
    onChange({ ...values, [key]: value });
  };

  const renderFilters = () => (
    filters.map(filter => (
      <FilterOption
        key={filter.key}
        type={filter.type}
        label={filter.label}
        options={filter.options}
        selected={values[filter.key]}
        onChange={(value) => handleChange(filter.key, value)}
      />
    ))
  );

  if (isMobile) {
    return (
      <>
        <Button
          leftIcon={<Icon as={FiFilter} />}
          onClick={onOpen}
          size="sm"
          bg="primary"
          color="text"
          _hover={{ bg: 'brand.primary.hover' }}
          _active={{ bg: 'brand.primary.active' }}
        >
          Filters
        </Button>

        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="background" color="text">
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px" borderColor="brand.border">
              Filters
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch">
                {renderFilters()}
                {showClearButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    borderColor="brand.border"
                    color="text"
                    _hover={{ bg: 'brand.primary.hover' }}
                    onClick={onClear}
                  >
                    Clear All
                  </Button>
                )}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box 
      p={4} 
      bg="background" 
      borderRadius="md" 
      shadow="sm"
      borderWidth="1px"
      borderColor="brand.border"
    >
      <HStack spacing={6} align="start" wrap="wrap">
        {renderFilters()}
        {showClearButton && (
          <Button
            variant="outline"
            size="sm"
            borderColor="brand.border"
            color="text"
            _hover={{ bg: 'brand.primary.hover' }}
            onClick={onClear}
          >
            Clear All
          </Button>
        )}
      </HStack>
    </Box>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'checkbox', 'radio']).isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ).isRequired,
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  showClearButton: PropTypes.bool
};

FilterOption.propTypes = {
  type: PropTypes.oneOf(['select', 'checkbox', 'radio']).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ])
};

export default FilterBar;
