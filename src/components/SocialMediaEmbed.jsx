import { Box, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SocialMediaEmbed = ({ teamId }) => {
  const [embedConfig, setEmbedConfig] = useState(null);

  useEffect(() => {
    const fetchEmbeds = async () => {
      const { data, error } = await supabase
        .from('team_social_config')
        .select('embed_code')
        .eq('team_id', teamId)
        .maybeSingle();

      if (!error && data) {
        setEmbedConfig(data);
      }
    };

    if (teamId) {
      fetchEmbeds();
    }
  }, [teamId]);

  if (!embedConfig?.embed_code) return null;

  return (
    <VStack spacing={4} width="100%" align="stretch">
      <Box 
        dangerouslySetInnerHTML={{ __html: embedConfig.embed_code }}
        className="social-embed"
      />
    </VStack>
  );
};

SocialMediaEmbed.propTypes = {
  teamId: PropTypes.string.isRequired
};

export default SocialMediaEmbed;



