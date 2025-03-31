import { ChakraProvider } from '@chakra-ui/react';
import AppRoutes from './AppRoutes';
import AuthProvider from './context/AuthContext';
import { BaseballCardProvider } from './context/BaseballCardContext';
import TeamProvider from './context/TeamProvider';
import './styles/base.css';
import './styles/tokens.css';
import theme from './theme/theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <TeamProvider>
          <BaseballCardProvider>
            <AppRoutes />
          </BaseballCardProvider>
        </TeamProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
