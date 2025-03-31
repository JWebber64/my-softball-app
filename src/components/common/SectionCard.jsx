import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const SectionCard = ({ title, icon, children }) => {
  return (
    <Box
      bg="brand.primary.base"
      color="brand.text.primary"
      borderRadius="lg"
      boxShadow="sm"
      minH={{ base: "400px", xl: "500px" }}
      overflow="auto"
      border="1px"
      borderColor="brand.border"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex
        align="center"
        p={4}
        borderBottom="1px"
        borderColor="brand.border"
      >
        {icon && <Icon as={icon} mr={2} color="brand.text.primary" />}
        <Heading size="md" color="brand.text.primary">{title}</Heading>
      </Flex>
      <Box p={4}>
        {children}
      </Box>
    </Box>
  );
};

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired
};

export default SectionCard;


