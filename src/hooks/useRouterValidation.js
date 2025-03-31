import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRouterValidation = () => {
  const location = useLocation();

  useEffect(() => {
    // Check for multiple router instances
    const routers = document.querySelectorAll('[data-reactroot]');
    if (routers.length > 1) {
      console.error(
        'Multiple router instances detected! ' +
        'This will cause routing issues. ' +
        'Please ensure BrowserRouter is only used in src/main.jsx'
      );
    }

    // Validate route structure
    validateRouteStructure(location.pathname);

    // Check for proper nesting
    validateRouterNesting();
  }, [location]);
};

function validateRouteStructure(pathname) {
  // Validate path format
  if (!pathname.startsWith('/')) {
    console.error('Invalid route path format:', pathname);
    return;
  }

  // Check for trailing slashes
  if (pathname !== '/' && pathname.endsWith('/')) {
    console.warn('Route has trailing slash:', pathname);
  }

  // Check for proper segmentation
  const segments = pathname.split('/').filter(Boolean);
  segments.forEach(segment => {
    if (segment.includes('.') || segment.includes('?')) {
      console.warn('Route segment contains invalid characters:', segment);
    }
  });
}

function validateRouterNesting() {
  // Check for proper context providers
  const providers = [
    'ChakraProvider',
    'BrowserRouter',
    'AuthProvider',
    'QueryClientProvider'
  ];

  providers.forEach(provider => {
    const elements = document.querySelectorAll(`[data-${provider.toLowerCase()}]`);
    if (elements.length === 0) {
      console.warn(`Missing ${provider} in component tree`);
    } else if (elements.length > 1) {
      console.error(`Multiple ${provider} instances detected`);
    }
  });
}
