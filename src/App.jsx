import { ChakraProvider } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import AppContent from './components/AppContent';
import ErrorBoundaryFallback from './components/common/ErrorBoundaryFallback';
import LoadingSpinner from './components/common/LoadingSpinner';
import AuthProvider from './context/AuthContext';
import TeamProvider from './context/TeamProvider';
import { supabase } from './lib/supabaseClient';
import theme from './theme/theme';
// Import CSS files BEFORE any component styles
import './styles/base.css';
import './styles/tokens.css';

const App = () => {
  const [connectionState, setConnectionState] = useState('connecting');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionState('connecting');
        const { error } = await supabase.from('team_members').select('count');
        if (error) throw error;
        console.log('Supabase connection successful');
        setConnectionState('connected');
      } catch (err) {
        console.error('Supabase connection failed:', err);
        setConnectionState('error');
        // Try again after a delay
        setTimeout(checkConnection, 3000);
      }
    };

    checkConnection();
  }, []);

  if (connectionState === 'connecting') {
    return <LoadingSpinner message="Connecting to database..." />;
  }

  if (connectionState === 'error') {
    return <LoadingSpinner message="Connection issues, retrying..." />;
  }

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <AuthProvider>
          <TeamProvider>
            <AppContent />
          </TeamProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
};

export default App;
