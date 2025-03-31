import {
  Box,
  Button,
  Container,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import ScoreSheetViewer from '../components/scoresheet/ScoreSheetViewer';
import { useTeam } from '../hooks/useTeam';
import { useTeamAccess } from '../hooks/useTeamAccess';
import { supabase } from '../lib/supabaseClient';

const ScoreSheetsPage = () => {
  const [scoreSheets, setScoreSheets] = useState([]);
  const [error, setError] = useState(null);
  const { team } = useTeam();
  const { isAdmin } = useTeamAccess(team?.id);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const fetchScoreSheets = useCallback(async () => { 
    try { 
      const { data, error: supabaseError } = await supabase
        .from('score_sheets')
        .order('created_at', { ascending: false });
      if (supabaseError) throw supabaseError;
      setScoreSheets(data || []);
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error fetching scoresheets',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchScoreSheets();
  }, [fetchScoreSheets]);

  const processFile = (file) => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'No file selected',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Invalid file type',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    // ... rest of processFile implementation
  };

  const handleUploadScoreSheet = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      processFile(file);
    }
    if (event?.target) {
      event.target.value = '';
    }
  };


  return (
    <Container maxW="container.xl" py={8}>
      {isAdmin && (
        <Box mb={6}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            colorScheme="blue"
          >
            Upload Sheet
          </Button>
        </Box>
      )}

      <SimpleGrid 
        columns={{ base: 1, md: 2, lg: 3 }} 
        spacing={6}
      >
        {scoreSheets.map(sheet => (
          <ScoreSheetViewer 
            key={sheet.id} 
            scoreSheet={sheet} 
            canEdit={isAdmin}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};

ScoreSheetsPage.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    game_number: PropTypes.number.isRequired,
    game_date: PropTypes.string.isRequired,
    opponent_name: PropTypes.string.isRequired,
    final_score: PropTypes.shape({
      us: PropTypes.number.isRequired,
      them: PropTypes.number.isRequired
    }).isRequired
  }))
};

export default ScoreSheetsPage;
