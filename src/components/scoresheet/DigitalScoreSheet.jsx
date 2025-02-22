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
    }
  }, [data]);

  const handleEventSelect = (event) => {
    if (!editable) return;
    
    // Clean and format the event
    const cleanEvent = event.trim().toUpperCase();
    const newEvents = [cleanEvent];
    setSelectedEvents(newEvents);

    // Calculate new base configurations based on the event
    const { baseConfig: newBaseConfig } = EventMapper.calculateBasePaths([cleanEvent]);
    setBaseConfig(newBaseConfig);

    // Notify parent of changes
    onDataChange?.({
      events: newEvents,
      outDetails,
      custom,
      baseConfig: newBaseConfig
    });

    setIsEventModalOpen(false);
  };

  return (
    <div className="flex w-full h-full items-center" style={{ gap: "0.75rem" }}>
      {/* Diamond */}
      <div
        className="relative self-center ml-1"
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

      <div className="flex flex-col space-y-2" style={{ width: "3.5rem" }}>
        {/* Event button */}
        <button
          className={`border text-[0.75rem] text-center p-0.5 ${editable ? 'hover:bg-gray-100' : ''}`}
          style={{ width: "3.5rem" }}
          onClick={() => editable && setIsEventModalOpen(true)}
          disabled={!editable}
        >
          {selectedEvents[0] || 'Event'}
        </button>
        
        {/* Out input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5"
          style={{ width: "3.5rem" }}
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

        {/* Custom/Note input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5"
          style={{ width: "3.5rem" }}
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

      {/* Event Selection Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleEventSelect('1B')} className="p-2 border rounded hover:bg-gray-100">1B</button>
              <button onClick={() => handleEventSelect('2B')} className="p-2 border rounded hover:bg-gray-100">2B</button>
              <button onClick={() => handleEventSelect('3B')} className="p-2 border rounded hover:bg-gray-100">3B</button>
              <button onClick={() => handleEventSelect('HR')} className="p-2 border rounded hover:bg-gray-100">HR</button>
              <button onClick={() => handleEventSelect('BB')} className="p-2 border rounded hover:bg-gray-100">BB</button>
              <button onClick={() => handleEventSelect('K')} className="p-2 border rounded hover:bg-gray-100">K</button>
              <button onClick={() => handleEventSelect('HBP')} className="p-2 border rounded hover:bg-gray-100">HBP</button>
              <button onClick={() => handleEventSelect('SAC')} className="p-2 border rounded hover:bg-gray-100">SAC</button>
              <button onClick={() => handleEventSelect('SF')} className="p-2 border rounded hover:bg-gray-100">SF</button>
            </div>
            <button 
              onClick={() => setIsEventModalOpen(false)}
              className="mt-4 w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
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
