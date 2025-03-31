import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      background: 'var(--app-background)',
      surface: {
        base: 'var(--app-surface)',
        hover: 'var(--app-gradient-middle)',
      },
      text: {
        primary: 'var(--app-text)',
      },
      border: 'var(--app-border)',
      primary: {
        base: 'var(--app-gradient-middle)',
        hover: 'var(--content-gradient-middle)',
      },
      status: {
        completed: 'var(--status-completed)',
        cancelled: 'var(--status-cancelled)',
        postponed: 'var(--status-postponed)'
      }
    }
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'brand.primary.base',
          color: 'brand.text.primary',
          _hover: {
            bg: 'brand.primary.hover',
            opacity: 0.8
          }
        },
        secondary: {
          bg: 'brand.surface.base',
          color: 'brand.text.primary',
          _hover: {
            opacity: 0.8
          }
        },
        danger: {
          bg: 'red.500',
          color: 'brand.text.primary',
          _hover: {
            bg: 'red.600',
            opacity: 0.8
          }
        }
      },
      defaultProps: {
        variant: 'primary'
      }
    }
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  }
});

export default theme;






