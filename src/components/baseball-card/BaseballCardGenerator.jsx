import React, { useState } from 'react';
import PropTypes from 'prop-types';
import BaseballCard from './BaseballCard';

const BaseballCardGenerator = ({ players, stats }) => {
  const [selectedCards, setSelectedCards] = useState([]);

  const handleExport = (imageData, playerId) => {
    // Handle individual card export
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `baseball-card-${playerId}.png`;
    link.click();
  };

  const handlePrint = () => {
    if (selectedCards.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Baseball Cards</title></head><body>');
    selectedCards.forEach(cardData => {
      printWindow.document.write(`<img src="${cardData}" style="page-break-after: always;" />`);
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div>
      <div className="cards-container">
        {players.map(player => (
          <BaseballCard
            key={player.id}
            player={player}
            stats={stats[player.id]}
            onExport={(imageData) => {
              setSelectedCards(prev => [...prev, imageData]);
              handleExport(imageData, player.id);
            }}
          />
        ))}
      </div>
      <button
        onClick={handlePrint}
        disabled={selectedCards.length === 0}
      >
        Print Selected
      </button>
    </div>
  );
};

BaseballCardGenerator.propTypes = {
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    player_name: PropTypes.string.isRequired,
    jersey_number: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    photoUrl: PropTypes.string.isRequired
  })).isRequired,
  stats: PropTypes.object.isRequired
};

export default BaseballCardGenerator;
