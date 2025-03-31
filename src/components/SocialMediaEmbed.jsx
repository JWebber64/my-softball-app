import { Box, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SocialMediaEmbed = ({ teamId }) => {
  const [embeds, setEmbeds] = useState([]);

  useEffect(() => {
    const fetchEmbeds = async () => {
      const { data, error } = await supabase
        .from('social_embeds')
        .select('*')
        .eq('team_id', teamId)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setEmbeds(data);
      }
    };

    if (teamId) {
      fetchEmbeds();
    }
  }, [teamId]);

  return (
    <VStack spacing={4} width="100%" align="stretch">
      {embeds.map((embed) => (
        <Box 
          key={embed.id}
          dangerouslySetInnerHTML={{ __html: embed.embed_code }}
          className="social-embed"
        />
      ))}
    </VStack>
  );
};

SocialMediaEmbed.propTypes = {
  teamId: PropTypes.string.isRequired
};

export default SocialMediaEmbed;


