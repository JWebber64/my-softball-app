import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BaseballCardGenerator from '../BaseballCardGenerator';

// Mock data
const mockPlayers = [
  {
    id: '1',
    player_name: 'John Doe',
    jersey_number: '42',
    position: 'Pitcher',
    photoUrl: 'http://example.com/photo1.jpg'
  },
  {
    id: '2',
    player_name: 'Jane Smith',
    jersey_number: '23',
    position: 'Catcher',
    photoUrl: 'http://example.com/photo2.jpg'
  }
];

const mockStats = {
  '1': {
    avg: '.302',
    games: 25,
    at_bats: 100,
    hits: 30,
    rbi: 15,
    runs: 20,
    home_runs: 5
  },
  '2': {
    avg: '.275',
    games: 23,
    at_bats: 95,
    hits: 26,
    rbi: 12,
    runs: 18,
    home_runs: 3
  }
};

// Mock BaseballCard component
vi.mock('../BaseballCard', () => ({
  default: ({ player, onExport }) => (
    <div 
      data-testid={`baseball-card-${player.id}`}
      onClick={() => onExport('mock-image-data')}
    >
      {player.player_name}
    </div>
  )
}));

describe('BaseballCardGenerator', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<BaseballCardGenerator players={[]} stats={{}} />);
    expect(screen.getByText('Print Selected')).toBeInTheDocument();
  });

  it('renders correct number of baseball cards', () => {
    render(<BaseballCardGenerator players={mockPlayers} stats={mockStats} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('disables print button when no cards are selected', () => {
    render(<BaseballCardGenerator players={mockPlayers} stats={mockStats} />);
    const printButton = screen.getByText('Print Selected');
    expect(printButton).toBeDisabled();
  });

  it('handles export functionality', async () => {
    render(
      <BaseballCardGenerator 
        players={mockPlayers} 
        stats={mockStats}
      />
    );

    const firstCard = screen.getByTestId('baseball-card-1');
    fireEvent.click(firstCard);

    // Verify that createElement was called with 'a'
    expect(document.createElement).toHaveBeenCalledWith('a');
    
    // Get the last created mock link
    const mockLink = document.createElement('a');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('handles print functionality', async () => {
    render(
      <BaseballCardGenerator 
        players={mockPlayers} 
        stats={mockStats}
      />
    );

    // Select a card
    const firstCard = screen.getByTestId('baseball-card-1');
    fireEvent.click(firstCard);

    // Wait for any state updates
    await vi.waitFor(() => {
      const printButton = screen.getByText('Print Selected');
      expect(printButton).not.toBeDisabled();
    });

    // Click print button
    const printButton = screen.getByText('Print Selected');
    fireEvent.click(printButton);

    // Wait for window.open to be called
    await vi.waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('', '_blank');
    });

    // Verify print was called on the window
    const mockPrintWindow = window.open();
    expect(mockPrintWindow.print).toHaveBeenCalled();
  });
});
