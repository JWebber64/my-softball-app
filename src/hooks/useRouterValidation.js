import { useEffect } from 'react';

export const useRouterValidation = () => {
  useEffect(() => {
    // Check if there are multiple router instances
    const routers = document.querySelectorAll('[data-reactroot]');
    if (routers.length > 1) {
      console.error(
        'Multiple router instances detected! ' +
        'This will cause routing issues. ' +
        'Please ensure BrowserRouter is only used in src/main.jsx'
      );
    }
  }, []);
};