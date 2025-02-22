import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { EventMapper } from '../../utils/eventMapper';

const DEFAULT_PLAYERS = [
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
];

const DigitalScoreSheet = ({ data, onDataChange, editable = true }) => {
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [innings, setInnings] = useState(Array(DEFAULT_PLAYERS.length).fill(Array(7).fill(null)));

  useEffect(() => {
    if (data) {
      setPlayers(data.players || DEFAULT_PLAYERS);
      setInnings(data.innings || Array(DEFAULT_PLAYERS.length).fill(Array(7).fill(null)));
    }
  }, [data]);

  const handlePlayerChange = (index, updatedPlayer) => {
    const newPlayers = [...players];
    newPlayers[index] = updatedPlayer;
    setPlayers(newPlayers);
    onChange?.({ players: newPlayers, innings });
  };

  const handleInningChange = (playerIndex, inningIndex, inningData) => {
    const newInnings = innings.map(row => [...row]); // Deep copy
    if (!newInnings[playerIndex]) {
      newInnings[playerIndex] = new Array(7).fill(null);
    }
    newInnings[playerIndex][inningIndex] = inningData;
    setInnings(newInnings);
    onChange?.({ players, innings: newInnings });
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-400 p-2 w-24 font-semibold">
              Player
            </th>
            {[1, 2, 3, 4, 5, 6, 7].map((inning) => (
              <th 
                key={inning} 
                className="border border-gray-400 p-1 w-36 font-semibold"
                style={{ width: "9rem" }}
              >
                {`${inning}${getOrdinalSuffix(inning)}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player, playerIndex) => (
            <tr key={playerIndex}>
              <td className="border border-gray-400 p-1">
                <PlayerCell 
                  player={player}
                  onChange={(updatedPlayer) => handlePlayerChange(playerIndex, updatedPlayer)}
                  editable={editable}
                />
              </td>
              {[0, 1, 2, 3, 4, 5, 6].map((inningIndex) => (
                <td key={inningIndex} className="border border-gray-400 p-2">
                  <InningCell
                    data={innings[playerIndex]?.[inningIndex]}
                    onChange={(inningData) => handleInningChange(playerIndex, inningIndex, inningData)}
                    editable={editable}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PlayerCell = ({ player, onChange, editable }) => {
  return (
    <div className="flex flex-col space-y-1">
      <input
        type="text"
        className="border text-sm p-1 w-24"
        placeholder="Name"
        value={player?.name || ''}
        onChange={(e) => editable && onChange({ ...player, name: e.target.value })}
        disabled={!editable}
      />
      <input
        type="text"
        className="border text-sm p-1 w-24"
        placeholder="Sub"
        value={player?.sub?.name || ''}
        onChange={(e) => editable && onChange({ 
          ...player, 
          sub: { ...player?.sub, name: e.target.value }
        })}
        disabled={!editable}
      />
    </div>
  );
};

const InningCell = ({ data, onDataChange, editable }) => {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [outDetails, setOutDetails] = useState('');
  const [custom, setCustom] = useState('');
  const [baseConfig, setBaseConfig] = useState({
    firstBase: false,
    secondBase: false,
    thirdBase: false,
    homePlate: false,
    scored: false
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showErrorDropdown, setShowErrorDropdown] = useState(false);
  const [showRBIDropdown, setShowRBIDropdown] = useState(false);
  const [rbiCount, setRbiCount] = useState(0);

  useEffect(() => {
    if (data) {
      setSelectedEvents(data.events || []);
      setOutDetails(data.outDetails || '');
      setCustom(data.custom || '');
      setBaseConfig(data.baseConfig || {
        firstBase: false,
        secondBase: false,
        thirdBase: false,
        homePlate: false,
        scored: false
      });
      // Extract RBI count from events if it exists
      const rbiEvent = data.events?.find(e => e.startsWith('RBI'));
      setRbiCount(rbiEvent ? parseInt(rbiEvent.replace('RBI', '')) : 0);
    }
  }, [data]);

  const handleEventSelect = (event) => {
    if (!editable) return;
    
    const cleanEvent = event.trim().toUpperCase();
    let newEvents = [...selectedEvents];
    
    if (cleanEvent.startsWith('RBI')) {
      // Update RBI count
      setRbiCount(parseInt(cleanEvent.replace('RBI', '')));
    } else {
      // Replace the main event (first element)
      newEvents[0] = cleanEvent;
    }
    
    setSelectedEvents(newEvents);
    
    const { baseConfig: newBaseConfig } = EventMapper.calculateBasePaths([cleanEvent]);
    setBaseConfig(newBaseConfig);
    
    onDataChange?.({
      events: newEvents,
      outDetails,
      custom,
      baseConfig: newBaseConfig
    });

    setIsEventModalOpen(false);
    setShowErrorDropdown(false);
    setShowRBIDropdown(false);
  };

  return (
    <div className="flex w-full h-full items-start" style={{ gap: "0.75rem" }}>
      {/* Left side - Diamond and RBI text */}
      <div className="flex flex-col items-center" style={{ height: "5.5rem" }}>
        {/* RBI text above diamond */}
        {rbiCount > 0 && (
          <span className="text-[0.7rem] font-semibold text-gray-700 whitespace-nowrap">
            {rbiCount} RBI
          </span>
        )}
        
        {/* Spacer to push diamond to center */}
        <div className="flex-1" />
        
        {/* Diamond */}
        <div
          className="relative"
          style={{ 
            width: "1.5rem",
            height: "1.5rem",
            transform: "rotate(45deg)",
            border: "1px solid black"
          }}
        >
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: baseConfig.scored ? 'rgba(0, 255, 0, 0.7)' : 'transparent',
            }}
          />
        </div>

        {/* Equal spacer below diamond */}
        <div className="flex-1" />
      </div>

      {/* Right side - All input boxes in single column */}
      <div className="flex flex-col space-y-2">
        {/* Event button */}
        <button
          className="border text-[0.75rem] text-center p-0.5 w-14"
          onClick={() => editable && setIsEventModalOpen(!isEventModalOpen)}
          disabled={!editable}
        >
          {selectedEvents[0] || 'Event'}
        </button>

        {/* Out input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5 w-14"
          placeholder="Out"
          value={outDetails}
          onChange={(e) => {
            if (!editable) return;
            setOutDetails(e.target.value);
            onDataChange?.({
              events: selectedEvents,
              outDetails: e.target.value,
              custom,
              baseConfig
            });
          }}
          disabled={!editable}
        />

        {/* Note input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5 w-14"
          placeholder="Note"
          value={custom}
          onChange={(e) => {
            if (!editable) return;
            setCustom(e.target.value);
            onDataChange?.({
              events: selectedEvents,
              outDetails,
              custom: e.target.value,
              baseConfig
            });
          }}
          disabled={!editable}
        />
      </div>
      
      {/* Event dropdown menu */}
      {isEventModalOpen && (
        <div className="absolute left-0 top-full mt-1 w-24 bg-white border rounded shadow-lg z-50">
          <div className="flex flex-col">
            {/* RBI button with dropdown */}
            <div className="relative">
              <button 
                className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full flex justify-between items-center"
                onClick={() => setShowRBIDropdown(!showRBIDropdown)}
              >
                RBI <span>▸</span>
              </button>
              {showRBIDropdown && (
                <div className="absolute left-full top-0 w-24 bg-white border rounded shadow-lg">
                  <button 
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('RBI1')}
                  >
                    1 RBI
                  </button>
                  <button 
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('RBI2')}
                  >
                    2 RBI
                  </button>
                  <button 
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('RBI3')}
                  >
                    3 RBI
                  </button>
                  <button 
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('RBI4')}
                  >
                    4 RBI
                  </button>
                </div>
              )}
            </div>

            {/* Hits */}
            <div className="border-t border-gray-200 mt-1"></div>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('1B')}
            >
              1B
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('2B')}
            >
              2B
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('3B')}
            >
              3B
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('HR')}
            >
              HR
            </button>

            {/* Outs */}
            <div className="border-t border-gray-200 mt-1"></div>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('K')}
            >
              K
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('F')}
            >
              F
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('G')}
            >
              G
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('L')}
            >
              L
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('DP')}
            >
              DP
            </button>

            {/* Other */}
            <div className="border-t border-gray-200 mt-1"></div>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('BB')}
            >
              BB
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('HBP')}
            >
              HBP
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('FC')}
            >
              FC
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('E')}
            >
              E
            </button>
            <button 
              className="text-left px-2 py-1 text-sm hover:bg-gray-100"
              onClick={() => handleEventSelect('SAC')}
            >
              SAC
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DigitalScoreSheet.propTypes = {
  data: PropTypes.shape({
    players: PropTypes.array,
    innings: PropTypes.array
  }),
  onChange: PropTypes.func,
  editable: PropTypes.bool
};

export default DigitalScoreSheet;
