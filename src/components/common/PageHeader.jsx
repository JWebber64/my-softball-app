import {
  Box,
  Heading,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const PageHeader = ({
  title,
  breadcrumbs = [],
  actions,
  subtitle
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      pb={4}
      mb={4}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          {breadcrumbs.length > 0 && (
            <Breadcrumb
              spacing="8px"
              separator={<ChevronRightIcon color="gray.500" />}
              mb={2}
            >
              {breadcrumbs.map((item, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink
                    as={RouterLink}
                    to={item.path}
                    color="gray.500"
                    fontSize="sm"
                  >
                    {item.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
          <Heading size="lg">{title}</Heading>
          {subtitle && (
            <Box mt={1} color="gray.500" fontSize="sm">
              {subtitle}
            </Box>
          )}
        </Box>
        {actions && (
          <Flex gap={2}>
            {actions}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    })
  ),
  actions: PropTypes.node,
  subtitle: PropTypes.string
};

export default PageHeader;