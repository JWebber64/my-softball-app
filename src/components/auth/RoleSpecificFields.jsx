import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
} from '@chakra-ui/react';

const RoleSpecificFields = ({ role, values, errors, handleChange }) => {
  const fields = {
    'user': [
      { name: 'first_name', label: 'First Name', type: 'text' },
      { name: 'last_name', label: 'Last Name', type: 'text' },
    ],
    'team-admin': [
      { name: 'team_name', label: 'Team Name', type: 'text' },
      { name: 'phone_number', label: 'Phone Number', type: 'tel' },
    ],
    'league-admin': [
      { name: 'league_name', label: 'League Name', type: 'text' },
      { name: 'organization', label: 'Organization', type: 'text' },
      { name: 'phone_number', label: 'Phone Number', type: 'tel' },
    ],
  };

  return (
    <VStack spacing={4} align="stretch">
      {fields[role]?.map((field) => (
        <FormControl 
          key={field.name} 
          isRequired 
          isInvalid={errors[field.name]}
        >
          <FormLabel>{field.label}</FormLabel>
          <Input
            type={field.type}
            name={field.name}
            value={values[field.name] || ''}
            onChange={handleChange}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
          <FormErrorMessage>{errors[field.name]}</FormErrorMessage>
        </FormControl>
      ))}
    </VStack>
  );
};

RoleSpecificFields.propTypes = {
  role: PropTypes.oneOf(['user', 'team-admin', 'league-admin']).isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default RoleSpecificFields;
