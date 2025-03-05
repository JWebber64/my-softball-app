// This file serves as the single source of truth for routing configuration
export const ROUTER_CONFIG = {
  // The file where BrowserRouter is initialized
  ROUTER_ROOT: 'src/main.jsx',
  
  // Available routes in the application
  ROUTES: {
    HOME: '/',
    SIGNIN: '/signin',
    TEAM_STATS: '/team-stats',
    SCORESHEETS: '/scoresheets',
    TEAM_ADMIN: '/team-admin',
    TEAM_INFO: '/team-info',
    LEAGUE_ADMIN: '/league-admin',
    LEAGUE_INFO: '/league-info',
    SIMPLE: '/simple',
    TEST: '/test',
    DEBUG: '/debug',
    PROFILE: '/profile'
  }
};

// Use this to verify if a route is valid
export const isValidRoute = (path) => {
  return Object.values(ROUTER_CONFIG.ROUTES).includes(path);
};
