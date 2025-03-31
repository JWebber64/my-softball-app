import { useEffect, useState } from 'react';
import { teamInfoService } from '../services/teamInfoService';
import { useTeam } from './useTeam';

export const useTeamData = () => {
  const { team } = useTeam();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!team?.id) {
        setLoading(false);
        return;
      }

      try {
        const [
          schedule,
          playerOfWeek,
          roster,
          news,
          socialConfig
        ] = await Promise.all([
          teamInfoService.getSchedule(team.id),
          teamInfoService.getPlayerOfWeek(team.id),
          teamInfoService.getTeamRoster(team.id),
          teamInfoService.getNews(team.id),
          teamInfoService.getSocialConfig(team.id),
        ]);

        setTeamData({
          schedule,
          playerOfWeek,
          roster,
          news,
          socialEmbed: socialConfig?.embed || '',
          socialLinks: socialConfig?.links || {},
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [team?.id]);

  return { teamData, loading, error };
};
