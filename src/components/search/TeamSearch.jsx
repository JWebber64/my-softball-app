import React, { useState } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Text,
  Button,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const TeamSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .ilike('name', `%${value}%`)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      toast({
        title: 'Error searching teams',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Box w="full" maxW="md">
        <InputGroup>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.300' />
          </InputLeftElement>
          <Input
            bg="white"
            placeholder="Search for teams..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            isDisabled={isSearching}
          />
        </InputGroup>
        {isSearching && <Text color="gray.500" mt={2}>Searching...</Text>}
      </Box>

      {results.length > 0 && (
        <List spacing={3} w="full" maxW="md">
          {results.map((team) => (
            <ListItem
              key={team.id}
              p={4}
              bg="white"
              borderRadius="md"
              boxShadow="sm"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text>{team.name}</Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => navigate(`/join-team/${team.id}`)}
              >
                Join Team
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
};

export default TeamSearch;