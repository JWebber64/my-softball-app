import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      background: '#7c866b',
      gradients: {
        dark: {
          start: '#111613',
          middle: '#1b2c14',
          end: '#111613'
        }
      },
      primary: {
        base: '#545e46',
        hover: '#4a5340'
      },
      secondary: '#2e3726',
      text: {
        primary: '#FFFFFF',
        secondary: '#E7F8E8',
        muted: '#c0fad0'
      },
      border: 'whiteAlpha.200'
    }
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.text.primary',
      }
    }
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: 'brand.primary.base',
          color: 'brand.text.primary',
          borderRadius: 'lg',
          boxShadow: 'lg',
          borderWidth: '1px',
          borderColor: 'brand.border'
        }
      }
    },
    Box: {
      variants: {
        card: {
          bg: 'brand.primary.base',
          color: 'brand.text.primary',
          borderRadius: 'lg',
          boxShadow: 'lg',
          borderWidth: '1px',
          borderColor: 'brand.border'
        }
      }
    }
  }
});

export default theme;
