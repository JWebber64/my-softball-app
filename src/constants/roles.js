// Central roles definition and utilities
export const ROLES = {
  LEAGUE_ADMIN: 'league-admin',
  TEAM_ADMIN: 'team-admin',
  COACH: 'coach',
  PLAYER: 'player',
  USER: 'user'
};

export const isAdmin = (role) => [ROLES.LEAGUE_ADMIN, ROLES.TEAM_ADMIN].includes(role);
export const isCoach = (role) => role === ROLES.COACH;
export const isPlayer = (role) => role === ROLES.PLAYER;

export const normalizeRole = (role) => {
  if (!role) return ROLES.USER;
  return role.toLowerCase();
};
