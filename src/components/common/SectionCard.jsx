import { Box, VStack, HStack, Heading, Icon, Spinner, Text } from '@chakra-ui/react';
import { WarningIcon, RepeatIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';

const SectionCard = ({
  title,
  children,
  icon,
  loading = false,
  error = null,
  isEmpty = false,
  onRefresh = null,
  ...props
}) => (
  <Box
    bg="white"
    borderRadius="lg"
    boxShadow="md"
    height="100%"
    width="100%"
    p={4}
    position="relative"
    {...props}
  >
    <VStack height="100%" spacing={4} align="stretch">
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          {icon && <Icon as={icon} boxSize={5} />}
          <Heading size="md">{title}</Heading>
        </HStack>
        {onRefresh && (
          <Icon
            as={RepeatIcon}
            cursor="pointer"
            onClick={onRefresh}
            _hover={{ transform: 'rotate(180deg)' }}
            transition="transform 0.3s ease"
          />
        )}
      </HStack>

      {loading ? (
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="xl" />
        </Box>
      ) : error ? (
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={2}>
            <WarningIcon boxSize={8} color="red.500" />
            <Text>{error.message || 'An error occurred'}</Text>
          </VStack>
        </Box>
      ) : isEmpty ? (
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <Text color="brand.text.muted">No data available</Text>
        </Box>
      ) : (
        <Box flex="1" overflow="hidden">
          {children}
        </Box>
      )}
    </VStack>
  </Box>
);

SectionCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.elementType,
  loading: PropTypes.bool,
  error: PropTypes.object,
  isEmpty: PropTypes.bool,
  onRefresh: PropTypes.func
};

export default SectionCard;
