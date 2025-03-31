import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, HStack, Link, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SocialMediaLinks = ({ teamId }) => {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('team_id', teamId);

      if (!error && data) {
        setLinks(data);
      }
    };

    if (teamId) {
      fetchLinks();
    }
  }, [teamId]);

  return (
    <VStack spacing={4} width="100%" align="center">
      <HStack spacing={4} wrap="wrap" justify="center">
        {links.map((link) => (
          <Link 
            key={link.id} 
            href={link.link} 
            isExternal
          >
            <Button
              leftIcon={<ExternalLinkIcon />}
              colorScheme="brand"
              variant="outline"
            >
              {link.platform}
            </Button>
          </Link>
        ))}
      </HStack>
    </VStack>
  );
};

SocialMediaLinks.propTypes = {
  teamId: PropTypes.string.isRequired
};

export default SocialMediaLinks;


