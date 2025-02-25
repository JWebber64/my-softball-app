import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  useToast,
  SimpleGrid
} from '@chakra-ui/react';
import { FaDownload, FaPrint } from 'react-icons/fa';
import BaseballCard from './BaseballCard';

const BaseballCardGenerator = ({ players, stats }) => {
  const toast = useToast();
  const [selectedCards, setSelectedCards] = useState([]);

  const handleExport = (imageData) => {
    // Create download link
    const link = document.createElement('a');
    link.download = 'baseball-card.png';
    link.href = imageData;
    link.click();
  };

  const handlePrintSelected = () => {
    // Create a new window with selected cards
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Baseball Cards</title>
          <style>
            .card-grid {
              display: grid;
              grid-template-columns: repeat(3, 63.5mm);
              gap: 10mm;
              padding: 10mm;
            }
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="card-grid">
            ${selectedCards.map(card => `
              <img src="${card}" style="width: 63.5mm; height: 88.9mm; object-fit: contain;">
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="flex-end">
        <Button
          leftIcon={<FaPrint />}
          onClick={handlePrintSelected}
          isDisabled={!selectedCards.length}
        >
          Print Selected
        </Button>
      </HStack>

      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {players.map(player => (
          <Box key={player.id} position="relative">
            <BaseballCard
              player={player}
              stats={stats[player.id]}
              onExport={handleExport}
            />
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default BaseballCardGenerator;