import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      primary: '#545e46',
      secondary: '#2d3436',
      background: '#7c866b',
      text: '#FFFFFF',
      border: 'rgba(255, 255, 255, 0.2)',
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'brand.primary',
          color: 'brand.text',
          _hover: {
            bg: '#6b7660',
          },
        },
        ghost: {
          color: 'brand.text',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    Header: {
      baseStyle: {
        bg: 'brand.primary',
        color: 'brand.text',
        py: 4,
        width: '100%',
        boxShadow: 'md',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.text',
      },
    },
  },
});

export default theme;
