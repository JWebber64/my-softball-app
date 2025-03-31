import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Textarea
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import { formFieldStyles } from '../../styles/formFieldStyles';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  isRequired,
  options,
  ...props
}) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            name={name}
            value={value}
            onChange={onChange}
            {...formFieldStyles}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                style={{ 
                  backgroundColor: 'var(--app-surface)',
                  color: 'var(--app-text)'
                }}
              >
                {option.label}
              </option>
            ))}
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            name={name}
            value={value}
            onChange={onChange}
            {...formFieldStyles}
            {...props}
          />
        );
      default:
        return (
          <Input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            {...formFieldStyles}
            {...props}
          />
        );
    }
  };

  return (
    <FormControl 
      isInvalid={!!error} 
      isRequired={isRequired}
    >
      {label && (
        <FormLabel color="brand.text.primary">
          {label}
        </FormLabel>
      )}
      {renderInput()}
      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : (
        helperText && (
          <FormHelperText color="brand.text.primary">
            {helperText}
          </FormHelperText>
        )
      )}
    </FormControl>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'select', 'textarea']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  )
};

export default FormField;





