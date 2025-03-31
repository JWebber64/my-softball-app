import { Box, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../lib/supabaseClient';
import BaseballCard from './BaseballCard';

const BaseballCardViewer = ({ isOpen, onClose, playerId, teamId = null }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('baseball_cards')
          .select('*')
          .eq('player_id', playerId);

        if (teamId) {
          query = query.eq('team_id', teamId);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        setCards(data || []);
      } catch (error) {
        console.error('Error fetching baseball cards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && playerId) {
      fetchCards();
    }
  }, [isOpen, playerId, teamId]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Baseball Cards</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Box>Loading cards...</Box>
          ) : cards.length === 0 ? (
            <Box>No baseball cards found.</Box>
          ) : (
            <Box position="relative">
              <BaseballCard {...cards[currentIndex]} />
              
              {cards.length > 1 && (
                <>
                  <IconButton
                    icon={<ChevronLeftIcon />}
                    position="absolute"
                    left={0}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={handlePrevious}
                  />
                  <IconButton
                    icon={<ChevronRightIcon />}
                    position="absolute"
                    right={0}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={handleNext}
                  />
                </>
              )}
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

BaseballCardViewer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  playerId: PropTypes.string.isRequired,
  teamId: PropTypes.string
};

export default BaseballCardViewer;