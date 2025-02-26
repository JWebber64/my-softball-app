// src/styles/constants.js

/**
 * Standard layout styles for the scoresheet comparison view
 * Based on the reference implementation in SCORESHEET_LAYOUT.md
 */
export const COMPARISON_VIEW_STYLES = {
  container: {
    display: 'grid',
    gridTemplateColumns: { base: '1fr', lg: '1fr 1fr' },
    gap: '2rem',
    width: '100%',
    maxWidth: '1800px',
    margin: '0 auto',
    padding: '1rem'
  },
  panel: {
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  heading: {
    size: 'md',
    mb: 4,
    textAlign: 'center'
  },
  image: {
    maxW: '100%',
    mx: 'auto',
    border: '1px solid',
    borderColor: 'gray.200'
  },
  noImageText: {
    textAlign: 'center',
    color: 'gray.500',
    py: 10
  }
};

/**
 * Standard styles for scoresheet inning cells
 * Based on v1.0 scoresheet layout
 */
export const INNING_CELL_STYLES = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.5rem',
    width: '9rem',
    height: '5.5rem',
    border: '1px solid',
    borderColor: 'gray.200'
  },
  diamondColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%'
  },
  diamond: {
    width: '1.5rem',
    height: '1.5rem',
    transform: 'rotate(45deg)',
    border: '1px solid',
    borderColor: 'gray.400'
  },
  inputColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    width: '3.5rem'
  },
  input: {
    width: '100%',
    height: '1.5rem',
    fontSize: 'sm'
  }
};

/**
 * Standard styles for navigation controls
 */
export const NAVIGATION_CONTROLS_STYLES = {
  container: {
    display: 'flex',
    gap: 4,
    mb: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    bg: 'brand.primary',
    color: 'brand.text',
    _hover: { bg: 'brand.secondary' }
  },
  gameInput: {
    width: '70px'
  }
};

/**
 * Standard color palette
 * Matches the colors defined in global.css
 */
export const COLOR_PALETTE = {
  background: '#7c866b',
  cardBackground: '#545e46',
  headerGradient: ['#111613', '#2e3726', '#111613'],
  text: {
    primary: '#FFFFFF',
    secondary: '#FFFFFF'
  }
};
