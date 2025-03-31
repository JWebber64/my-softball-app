import { Badge } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    const baseStyles = {
      px: 2,
      py: 1,
      borderRadius: 'full',
      textTransform: 'capitalize'
    };

    switch (status.toLowerCase()) {
      case 'active':
        return {
          ...baseStyles,
          bg: 'var(--app-success)',
          color: 'var(--app-text)'
        };
      case 'pending':
        return {
          ...baseStyles,
          bg: 'var(--app-warning)',
          color: 'var(--app-text)'
        };
      case 'completed':
        return {
          ...baseStyles,
          bg: 'var(--app-info)',
          color: 'var(--app-text)'
        };
      case 'cancelled':
        return {
          ...baseStyles,
          bg: 'var(--app-error)',
          color: 'var(--app-text)'
        };
      default:
        return {
          ...baseStyles,
          bg: 'var(--app-surface)',
          color: 'var(--app-text)'
        };
    }
  };

  return (
    <Badge {...getStatusStyles(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired
};

export default StatusBadge;


