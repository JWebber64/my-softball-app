export const formFieldStyles = {
  bg: "brand.primary.base",  // Changed from brand.surface.base
  color: "brand.text.primary",
  borderColor: "brand.border",
  _hover: { borderColor: 'brand.primary.hover' },
  _focus: { 
    borderColor: 'brand.primary.hover',
    boxShadow: 'none'
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
      bg: 'var(--switch-active)',
    },
    '&[data-checked] .chakra-switch__thumb': {
      bg: 'brand.text.primary',
    }
  }
};

export const formLabelStyles = {
  color: "brand.text.primary"
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







