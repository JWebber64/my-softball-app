// Media upload configuration
export const MEDIA_CONFIG = {
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif'],
    SCORESHEETS: ['image/jpeg', 'image/png', 'application/pdf'],
    VIDEOS: ['video/mp4', 'video/webm']
  },
  MAX_FILE_SIZE: {
    IMAGES: 5 * 1024 * 1024, // 5MB
    SCORESHEETS: 10 * 1024 * 1024, // 10MB
    VIDEOS: 50 * 1024 * 1024 // 50MB
  },
  UPLOAD_PATH: '/uploads'
};

// Default asset paths
export const DEFAULT_ASSETS = {
  IMAGES: {
    TEAM_LOGO: '/assets/default-team-logo.png',
    PLAYER_PHOTO: '/assets/default-player-photo.png',
    SCORESHEET: '/assets/default-scoresheet.png',
    VIDEO_THUMBNAIL: '/assets/default-video-thumbnail.png',
    FALLBACK: {
      PHOTO: '/assets/default-photo-placeholder.png',
      VIDEO: '/assets/default-video-placeholder.png'
    }
  }
};

// Storage bucket constants
export const STORAGE_BUCKETS = {
  TEAM_LOGOS: 'team-logos',
  PLAYER_PHOTOS: 'players',
  SCORESHEETS: 'scoresheets',
  TEAM_ASSETS: 'team-assets',
  BASEBALL_CARDS: 'baseball-cards'
};

// Router configuration
export const ROUTER_CONFIG = {
  ROOT: 'src/main.jsx',
  ROUTES: {
    HOME: '/',
    SIGNIN: '/signin',
    TEAM_ADMIN: '/team-admin',
    LEAGUE_ADMIN: '/league-admin',
    PROFILE: '/profile',
    TEAM_INFO: '/team-info',  // Changed from '/team/:id'
    TEAM_DETAIL: '/team/:id', // Add this new route for individual team pages
    TEAM_STATS: '/team-stats',
    SCORE_SHEETS: '/score-sheets',
    AUTH_CALLBACK: '/auth/callback',
    LEAGUE_INFO: '/league-info',
    LOGOUT: '/logout',
    PLAYER_STATS: '/player-stats'
  }
};

export const isValidRoute = (path) => {
  return Object.values(ROUTER_CONFIG.ROUTES).includes(path);
};






