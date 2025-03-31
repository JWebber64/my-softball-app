// Only keep structural styles that aren't handled by the theme
export const defaultFormFieldStyles = {
  _disabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  }
};

export const defaultSelectStyles = {
  ...defaultFormFieldStyles
};
