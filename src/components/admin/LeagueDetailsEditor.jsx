import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CardContainer from '../common/CardContainer';
import SectionCard from '../common/SectionCard';

const LeagueDetailsEditor = ({ leagueId }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLeagueDetails();
  }, [leagueId]);

  const fetchLeagueDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        season: data.season || '',
        startDate: data.start_date || '',
        endDate: data.end_date || ''
      });
    } catch (error) {
      toast({
        title: 'Error fetching league details',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('leagues')
        .update({
          name: formData.name,
          season: formData.season,
          start_date: formData.startDate,
          end_date: formData.endDate
        })
        .eq('id', leagueId);

      if (error) throw error;

      toast({
        title: 'League details updated successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error updating league details',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardContainer>
      <SectionCard title="League Details">
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>League Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter league name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Season</FormLabel>
              <Input
                value={formData.season}
                onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                placeholder="Enter season (e.g., Spring 2024)"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </VStack>
        </form>
      </SectionCard>
    </CardContainer>
  );
};

export default LeagueDetailsEditor;