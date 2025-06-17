import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'var(--app-background)',
        color: 'var(--app-text)'
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        _focus: {
          boxShadow: 'none',
        },
      },
      variants: {
        primary: {
          className: 'app-gradient',
          color: 'brand.text.primary',
          border: 'none',
          _hover: {
            opacity: 0.9,
          },
          _active: {
            opacity: 0.8,
          },
          _disabled: {
            opacity: 0.6,
            cursor: 'not-allowed',
            _hover: {
              opacity: 0.6,
            },
          },
        },
        // Make edit button use the same token variables as primary
        edit: {
          className: 'app-gradient',
          color: 'brand.text.primary',
          border: 'none',
          _hover: {
            opacity: 0.9,
          },
          _active: {
            opacity: 0.8,
          },
        },
        // Add the cancel button variant
        cancel: {
          bg: 'black',
          color: 'white',
          _hover: { bg: 'gray.800' },
          _active: { bg: 'gray.900' },
        },
        // Keep other variants for specific cases
        outline: {
          borderColor: 'brand.border',
          color: 'brand.text.primary',
        },
        danger: {
          bg: 'var(--status-cancelled)',
          color: 'brand.text.primary',
        },
      },
      defaultProps: {
        variant: 'primary', // Make our gradient the default
      },
    },
  },
  colors: {
    brand: {
      primary: {
        base: 'var(--app-surface)',
        hover: 'var(--app-gradient-middle)',
        active: 'var(--app-gradient-end)',
      },
      background: 'var(--app-background)',
      surface: {
        base: 'var(--app-surface)',
        input: 'var(--form-field-bg)',
      },
      text: {
        primary: 'var(--app-text)',
        placeholder: 'var(--app-text)'
      },
      border: 'var(--app-border)',
      gradient: {
        start: 'var(--app-gradient-start)',
        middle: 'var(--app-gradient-middle)',
        end: 'var(--app-gradient-end)'
      },
      button: {
        primary: 'var(--button-primary)',
        primaryHover: 'var(--button-primary-hover)',
        edit: 'var(--button-edit)',
        editHover: 'var(--button-edit-hover)',
        delete: 'var(--button-delete)',
        deleteHover: 'var(--button-delete-hover)',
        cancel: 'var(--button-cancel)',
        cancelHover: 'var(--button-cancel-hover)'
      },
      scoresheet: {
        background: 'var(--scoresheet-bg)',
        text: 'var(--scoresheet-text)',
        border: 'var(--scoresheet-border)',
        headerBg: 'var(--scoresheet-header-bg)',
        diamondBorder: 'var(--scoresheet-diamond-border)',
        diamondFilled: 'var(--scoresheet-diamond-filled)',
        inputBg: 'var(--scoresheet-input-bg)',
        inputBorder: 'var(--scoresheet-input-border)'
      }
    }
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  }
});

export default theme;










