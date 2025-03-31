import {
  Button,
  ButtonGroup,
  Flex,
  Select,
  Text
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSize = true
}) => {
  return (
    <Flex
      justify="space-between"
      align="center"
      w="100%"
      gap={4}
      py={4}
    >
      <Text fontSize="sm" color="gray.600">
        Page {currentPage} of {totalPages}
      </Text>

      <ButtonGroup size="sm" variant="outline">
        <Button
          leftIcon={<ChevronLeftIcon />}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage <= 1}
        >
          Previous
        </Button>
        <Button
          rightIcon={<ChevronRightIcon />}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </ButtonGroup>

      {showPageSize && (
        <Flex align="center" gap={2}>
          <Text fontSize="sm" whiteSpace="nowrap">
            Items per page:
          </Text>
          <Select
            size="sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            w="auto"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </Flex>
      )}
    </Flex>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  showPageSize: PropTypes.bool
};

export default Pagination;