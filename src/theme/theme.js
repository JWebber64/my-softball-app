import { extendTheme } from '@chakra-ui/react';

// Define breakpoints for different screen sizes
const breakpoints = {
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1536px',
};

const theme = extendTheme({
  breakpoints,
  colors: {
    brand: {
      primary: '#545e46',
      secondary: '#2e3726',
      text: '#EFF7EC',
    }
  },
  // Responsive container sizes
  sizes: {
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    }
  },
  // Component-specific styles with responsive values
  components: {
    Table: {
      baseStyle: {
        th: {
          color: '#EFF7EC',
          fontSize: { base: 'xs', md: 'sm', lg: 'md' }, // Responsive font sizes
        },
        td: {
          color: '#EFF7EC',
          fontSize: { base: 'xs', md: 'sm', lg: 'md' },
        }
      }
    },
    Heading: {
      baseStyle: {
        color: '#EFF7EC',
      },
      // Responsive sizes for different heading levels
      sizes: {
        xl: {
          fontSize: { base: '2xl', md: '3xl', lg: '4xl' },
          lineHeight: { base: '1.2', md: '1.4' },
        },
        lg: {
          fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
          lineHeight: { base: '1.2', md: '1.4' },
        },
        md: {
          fontSize: { base: 'lg', md: 'xl', lg: '2xl' },
          lineHeight: { base: '1.2', md: '1.4' },
        },
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '0.625rem', // 25% increase
          padding: { base: '4', md: '6', lg: '8' }, // Responsive padding
          margin: { base: '2', md: '4' }, // Responsive margin
        }
      }
    },
    Button: {
      baseStyle: {
        borderRadius: '0.3125rem', // 25% increase
        _focus: {
          boxShadow: 'outline',
        },
      }
    },
    // Custom styles for the grid layout
    Grid: {
      baseStyle: {
        gap: { base: '4', md: '6', lg: '8' },
      }
    }
  },
  // Global styles with responsive values
  styles: {
    global: {
      body: {
        bg: '#7c866b', // Updated from #1a1a1a to match your color scheme
        color: '#EFF7EC',
        fontSize: { base: 'sm', md: 'md', lg: 'lg' },
      },
      // Responsive container padding
      '.container': {
        px: { base: '4', md: '6', lg: '8' },
        py: { base: '2', md: '4', lg: '6' },
      }
    }
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme;
