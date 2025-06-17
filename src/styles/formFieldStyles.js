export const formFieldStyles = {
  bg: "brand.surface.input",
  color: "brand.text.primary",
  borderColor: "brand.border",
  _hover: { borderColor: 'brand.primary.hover' },
  _focus: { 
    borderColor: 'brand.primary.hover',
    boxShadow: 'none'
  },
  _placeholder: {
    color: 'brand.text.placeholder'
  },
  sx: {
    '& option': {
      bg: 'brand.surface.base',
      color: 'brand.text.primary'
    }
  }
};

export const switchStyles = {
  sx: {
    '& .chakra-switch__track': {
      bg: 'brand.surface.base',
      borderColor: 'brand.border',
    },
    '& .chakra-switch__thumb': {
      bg: 'brand.text.primary',
    },
    '&[data-checked] .chakra-switch__track': {
      bg: 'var(--form-field-bg)',  // Using the light green color
    },
    '&[data-checked] .chakra-switch__thumb': {
      bg: 'brand.text.primary',
    }
  }
};

export const formLabelStyles = {
  color: "brand.text.primary",
  fontWeight: "medium"
};

export const formHelperTextStyles = {
  color: "brand.text.primary",
  opacity: 0.8
};

export const formErrorStyles = {
  color: "brand.error"
};

export const selectOptionStyles = {
  backgroundColor: 'brand.surface.base',
  color: 'brand.text.primary'
};













