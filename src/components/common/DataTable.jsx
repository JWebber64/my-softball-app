import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  IconButton,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const DataTable = ({
  columns,
  data,
  pagination = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  },
  onPageChange,
  onPageSizeChange,
  isLoading = false
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);

  return (
    <Box>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th key={index}>{column.header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, rowIndex) => (
              <Tr
                key={rowIndex}
                _hover={{ bg: hoverBg }}
              >
                {columns.map((column, colIndex) => (
                  <Td key={colIndex}>
                    {column.render ? column.render(row) : row[column.accessor]}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Flex
        justify="space-between"
        align="center"
        mt={4}
        px={2}
        borderTop="1px"
        borderColor={borderColor}
        pt={4}
      >
        <Flex align="center" gap={2}>
          <Text fontSize="sm">Rows per page:</Text>
          <Select
            size="sm"
            value={pagination.pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            width="70px"
          >
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </Flex>

        <Flex align="center" gap={4}>
          <Text fontSize="sm">
            Page {pagination.currentPage} of {totalPages}
          </Text>
          <Flex gap={2}>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => onPageChange(pagination.currentPage - 1)}
              isDisabled={pagination.currentPage === 1}
              size="sm"
              aria-label="Previous page"
            />
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => onPageChange(pagination.currentPage + 1)}
              isDisabled={pagination.currentPage === totalPages}
              size="sm"
              aria-label="Next page"
            />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalItems: PropTypes.number.isRequired
  }),
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default DataTable;
