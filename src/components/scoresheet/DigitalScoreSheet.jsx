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
  { name: '', sub: { name: '' } },
  { name: '', sub: { name: '' } },
];

const DigitalScoreSheet = ({ data, onDataChange, editable = true }) => {
  const textStyle = {
    color: '#000000',
    fontWeight: 'bold',
  };

  const inputStyle = {
    ...textStyle,
    backgroundColor: '#ffffff',
  };

  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [showExtraInnings, setShowExtraInnings] = useState(false);
  const [innings, setInnings] = useState(Array(DEFAULT_PLAYERS.length).fill(Array(10).fill(null))); // Expanded to 10 innings

  useEffect(() => {
    if (data) {
      setPlayers(data.players || DEFAULT_PLAYERS);
      setInnings(data.innings || Array(DEFAULT_PLAYERS.length).fill(Array(10).fill(null)));
    }
  }, [data]);

  const handlePlayerChange = (index, updatedPlayer) => {
    const newPlayers = [...players];
    newPlayers[index] = updatedPlayer;
    setPlayers(newPlayers);
    onDataChange?.({ players: newPlayers, innings });
  };

  const handleInningChange = (playerIndex, inningIndex, inningData) => {
    const newInnings = innings.map(row => [...row]); // Deep copy
    if (!newInnings[playerIndex]) {
      newInnings[playerIndex] = new Array(10).fill(null);
    }
    newInnings[playerIndex][inningIndex] = inningData;
    setInnings(newInnings);
    onDataChange?.({ players, innings: newInnings });
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
    <div className="digital-scoresheet" style={textStyle}>
      <div className="flex justify-end mb-2">
        <button
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
          onClick={() => setShowExtraInnings(!showExtraInnings)}
        >
          <span>{showExtraInnings ? '−' : '+'}</span>
          {showExtraInnings ? 'Hide Extra Innings' : 'Show Extra Innings'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2 w-24 font-semibold text-black">
                Player
              </th>
              {/* Regular Innings */}
              {[1, 2, 3, 4, 5, 6, 7].map((inning) => (
                <th 
                  key={inning} 
                  className="border border-gray-400 p-1 w-36 font-semibold text-black"
                  style={{ width: "9rem" }}
                >
                  {`${inning}${getOrdinalSuffix(inning)}`}
                </th>
              ))}
              {/* Extra Innings */}
              {showExtraInnings && [8, 9, 10].map((inning) => (
                <th 
                  key={inning} 
                  className="border border-gray-400 p-1 w-36 font-semibold bg-gray-50 text-black"
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
                {/* Regular Innings */}
                {[0, 1, 2, 3, 4, 5, 6].map((inningIndex) => (
                  <td key={inningIndex} className="border border-gray-400 p-2">
                    <InningCell
                      data={innings[playerIndex]?.[inningIndex]}
                      onChange={(inningData) => handleInningChange(playerIndex, inningIndex, inningData)}
                      editable={editable}
                    />
                  </td>
                ))}
                {/* Extra Innings */}
                {showExtraInnings && [7, 8, 9].map((inningIndex) => (
                  <td key={inningIndex} className="border border-gray-400 p-2 bg-gray-50">
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
    </div>
  );
};

const PlayerCell = ({ player, onChange, editable }) => {
  const textStyle = {
    color: '#000000',
    fontWeight: 'bold',
  };

  const inputStyle = {
    ...textStyle,
    backgroundColor: '#ffffff',
  };

  return (
    <div className="flex flex-col space-y-1" style={textStyle}>
      <input
        type="text"
        className="border text-sm p-1 w-24"
        placeholder="Name"
        value={player?.name || ''}
        onChange={(e) => editable && onChange({ ...player, name: e.target.value })}
        disabled={!editable}
        style={inputStyle}
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
        style={inputStyle}
      />
    </div>
  );
};

const InningCell = ({ data, onDataChange, editable }) => {
  const textStyle = {
    color: '#000000',
    fontWeight: 'bold',
  };

  const inputStyle = {
    ...textStyle,
    backgroundColor: '#ffffff',
  };

  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedRBI, setSelectedRBI] = useState('');
  const [outDetails, setOutDetails] = useState('');
  const [custom, setCustom] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [scored, setScored] = useState(false);
  // Add new states for advancement lines
  const [firstToSecondLine, setFirstToSecondLine] = useState(false);
  const [secondToThirdLine, setSecondToThirdLine] = useState(false);
  const [thirdToHomeLine, setThirdToHomeLine] = useState(false);
  const [firstBase, setFirstBase] = useState(false);
  const [secondBase, setSecondBase] = useState(false);
  const [thirdBase, setThirdBase] = useState(false);
  const [firstToSecondOut, setFirstToSecondOut] = useState(false);  // New state for DP out line
  const [secondToThirdOut, setSecondToThirdOut] = useState(false);
  const [thirdToHomeOut, setThirdToHomeOut] = useState(false);

  const handleEventSelect = (event) => {
    if (event.startsWith('RBI')) {
      setSelectedRBI(event);
    } else {
      // Only update the displayed event text for non-advancement and non-force-out actions
      if (!['1TO2', '2TO3', '3HOME', 'FO2', 'FO3', 'FOH'].includes(event)) {
        setSelectedEvent(event);
      }
      
      switch(event) {
        case '1B':
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setScored(false);
          setFirstBase(true);
          break;
        case '2B':
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setScored(false);
          setSecondBase(true);
          break;
        case '3B':
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setScored(false);
          setThirdBase(true);
          break;
        case 'HR':
          setFirstBase(false);
          setSecondBase(false);
          setThirdBase(false);
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setScored(true);
          break;
        case '1TO2':
          setFirstToSecondLine(true);
          break;
        case '2TO3':
          setSecondToThirdLine(true);
          break;
        case '3HOME':
          // Clear all lines and just show filled diamond for scoring
          setFirstBase(false);
          setSecondBase(false);
          setThirdBase(false);
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setScored(true);
          break;
        case 'DP':
          // For batter hitting into DP, show no lines at all
          setFirstBase(false);
          setSecondBase(false);
          setThirdBase(false);
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setFirstToSecondOut(false);
          setSecondToThirdOut(false);
          setThirdToHomeOut(false);
          setScored(false);
          break;
        case 'FO2':
          // Keep the single (firstBase) line
          setSecondBase(false);
          setThirdBase(false);
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setScored(false);
          // Show first base line for the single
          setFirstBase(true);
          // Show the partial line for the out
          setFirstToSecondOut(true);
          setOutDetails('FO2');
          break;
        case 'FO3':
          setSecondToThirdOut(true);  // We'll need to add this state and line
          setOutDetails('FO3');
          break;
        case 'FOH':
          setThirdToHomeOut(true);    // We'll need to add this state and line
          setOutDetails('FOH');
          break;
        default:
          // Clear all lines and scoring for other events
          setFirstBase(false);
          setSecondBase(false);
          setThirdBase(false);
          setFirstToSecondLine(false);
          setSecondToThirdLine(false);
          setThirdToHomeLine(false);
          setFirstToSecondOut(false);
          setSecondToThirdOut(false);  // New state to clear
          setThirdToHomeOut(false);    // New state to clear
          setScored(false);
      }
    }
    setIsEventModalOpen(false);
    onDataChange?.({
      event: event.startsWith('RBI') ? selectedEvent : 
            ['1TO2', '2TO3', '3HOME'].includes(event) ? selectedEvent : event,
      rbi: event.startsWith('RBI') ? event : selectedRBI,
      outDetails,
      custom
    });
  };

  const handleClear = () => {
    setSelectedEvent('');
    setSelectedRBI('');
    setIsEventModalOpen(false);
    // Reset all visual states
    setFirstBase(false);
    setSecondBase(false);
    setThirdBase(false);
    setFirstToSecondLine(false);
    setSecondToThirdLine(false);
    setThirdToHomeLine(false);
    setFirstToSecondOut(false);
    setSecondToThirdOut(false);
    setThirdToHomeOut(false);
    setScored(false);
    onDataChange?.({
      event: '',
      rbi: '',
      outDetails,
      custom
    });
  };

  const displayText = `${selectedRBI ? selectedRBI + ' ' : ''}${selectedEvent || ''}`;
  const hasContent = selectedEvent || selectedRBI;
  const isHomeRun = selectedEvent === 'HR';
  const isSingle = selectedEvent === '1B';
  const isDouble = selectedEvent === '2B';
  const isTriple = selectedEvent === '3B';

  return (
    <div className="flex w-full h-full items-center" style={{ gap: "0.75rem" }}>
      {/* Left column - Diamond */}
      <div className="relative self-center ml-1">
        {/* Diamond */}
        <div
          className="relative"
          style={{ 
            width: "1.5rem",
            height: "1.5rem",
            transform: "rotate(45deg)",
            border: "1px solid black",
            backgroundColor: scored ? "#545e46" : "transparent",
            transition: "background-color 0.2s ease-in-out"
          }}
        />
        
        {/* Line to First Base */}
        {firstBase && (
          <div
            className="absolute"
            style={{
              width: "1.45rem",
              height: "2px",
              backgroundColor: "#545e46",
              bottom: "-4px",
              right: "-4px",
              transform: "translate(32%, 32%) rotate(-45deg)",
              transformOrigin: "left center",
              transition: "opacity 0.2s ease-in-out"
            }}
          />
        )}

        {/* Line to Second Base (for doubles) */}
        {secondBase && (
          <>
            <div
              className="absolute"
              style={{
                width: "1.45rem",
                height: "2px",
                backgroundColor: "#545e46",
                bottom: "-4px",
                right: "-4px",
                transform: "translate(32%, 32%) rotate(-45deg)",
                transformOrigin: "left center",
                transition: "opacity 0.2s ease-in-out"
              }}
            />
            <div
              className="absolute"
              style={{
                width: "1.45rem",
                height: "2px",
                backgroundColor: "#545e46",
                top: "-4px",
                right: "-4px",
                transform: "translate(32%, -32%) rotate(45deg)",
                transformOrigin: "left center",
                transition: "opacity 0.2s ease-in-out"
              }}
            />
          </>
        )}

        {/* Line to Third Base (for triples) */}
        {thirdBase && (
          <>
            <div
              className="absolute"
              style={{
                width: "1.45rem",
                height: "2px",
                backgroundColor: "#545e46",
                bottom: "-4px",
                right: "-4px",
                transform: "translate(32%, 32%) rotate(-45deg)",
                transformOrigin: "left center",
                transition: "opacity 0.2s ease-in-out"
              }}
            />
            <div
              className="absolute"
              style={{
                width: "1.45rem",
                height: "2px",
                backgroundColor: "#545e46",
                top: "-4px",
                right: "-4px",
                transform: "translate(32%, -32%) rotate(45deg)",
                transformOrigin: "left center",
                transition: "opacity 0.2s ease-in-out"
              }}
            />
            <div
              className="absolute"
              style={{
                width: "1.45rem",
                height: "2px",
                backgroundColor: "#545e46",
                top: "-4px",
                left: "-4px",
                transform: "translate(-32%, -32%) rotate(-45deg)",
                transformOrigin: "right center",
                transition: "opacity 0.2s ease-in-out"
              }}
            />
          </>
        )}

        {/* Advancement Lines */}
        {firstToSecondLine && (
          <div
            className="absolute"
            style={{
              width: "1.45rem",
              height: "2px",
              backgroundColor: "#545e46",
              top: "-4px",
              right: "-4px",
              transform: "translate(32%, -32%) rotate(45deg)",
              transformOrigin: "left center",
              transition: "opacity 0.2s ease-in-out"
            }}
          />
        )}

        {secondToThirdLine && (
          <div
            className="absolute"
            style={{
              width: "1.45rem",
              height: "2px",
              backgroundColor: "#545e46",
              top: "-4px",
              left: "-4px",
              transform: "translate(-32%, -32%) rotate(-45deg)",
              transformOrigin: "right center",
              transition: "opacity 0.2s ease-in-out"
            }}
          />
        )}

        {thirdToHomeLine && (
          <div
            className="absolute"
            style={{
              width: "1.45rem",
              height: "2px",
              backgroundColor: "#545e46",
              bottom: "-4px",
              left: "-4px",
              transform: "translate(-32%, 32%) rotate(45deg)",
              transformOrigin: "right center",
              transition: "opacity 0.2s ease-in-out"
            }}
          />
        )}

        {/* Partial line for force out at second */}
        {firstToSecondOut && (
          <div
            className="absolute"
            style={{
              width: "0.725rem", // Half of 1.45rem
              height: "2px",
              backgroundColor: "#545e46",
              top: "20%",
              right: "-4px",
              transform: "translate(2px, -2px) rotate(45deg)", // Added small translation
              transformOrigin: "left center",
              transition: "opacity 0.2s ease-in-out"
            }}
          />
        )}

        {/* Partial line for force out at third */}
        {secondToThirdOut && (
          <div
            className="absolute"
            style={{
              width: "0.725rem",
              height: "2px",
              backgroundColor: "#545e46",
              top: "-3.5px",  // Keeping this
              left: "9.5%",   // Bigger adjustment from 10.25% to 9.5%
              transform: "translate(-0.5px, -0.5px) rotate(-45deg)", // Keeping this to maintain end position
              transformOrigin: "right center",
              transition: "opacity 0.2s ease-in-out"
            }}
          />
        )}

        {/* Partial line for force out at home */}
        {thirdToHomeOut && (
          <div
            className="absolute"
            style={{
              width: "0.725rem",
              height: "2px",
              backgroundColor: "#545e46",
              bottom: "20%",
              left: "-4px",
              transform: "translate(-2px, 2px) rotate(45deg)", // Adjusted for third-to-home direction
              transformOrigin: "right center",
              transition: "opacity 0.2s ease-in-out"
            }}
          />
        )}
      </div>
      
      {/* Right column - Input Fields */}
      <div className="flex flex-col space-y-2" style={{ width: "3.5rem" }}>
        {/* Event Button */}
        <div className="relative">
          <button
            className="border text-[0.75rem] text-center p-0.5 w-14 truncate"
            onClick={() => editable && setIsEventModalOpen(!isEventModalOpen)}
            disabled={!editable}
            title={displayText || 'Event'}
            style={textStyle}
          >
            {displayText || 'Event'}
          </button>

          {/* Event Dropdown Menu */}
          {isEventModalOpen && (
            <div className="absolute left-0 top-full mt-1 w-24 bg-white border rounded shadow-lg z-50">
              {hasContent && (
                <>
                  <button
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full text-red-800 font-medium"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                  <div className="border-t border-gray-200"></div>
                </>
              )}
              
              {/* Hits Section */}
              {['1B', '2B', '3B', 'HR'].map(hit => (
                <button
                  key={hit}
                  className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full text-black font-medium"
                  onClick={() => handleEventSelect(hit)}
                >
                  {hit}
                </button>
              ))}

              {/* Runner Section (formerly Advance Runners) */}
              <div className="relative group">
                <button className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full flex justify-between items-center text-black font-medium">
                  Runner <span>▸</span>
                </button>
                <div className="absolute left-full top-0 w-32 bg-white border rounded shadow-lg hidden group-hover:block">
                  {/* Advance options */}
                  <button
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('1TO2')}
                  >
                    2nd
                  </button>
                  <button
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('2TO3')}
                  >
                    3rd
                  </button>
                  <button
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('3HOME')}
                  >
                    Home
                  </button>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>
                  
                  {/* Force out options */}
                  <button
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('FO2')}
                  >
                    Out at 2nd
                  </button>
                  <button
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('FO3')}
                  >
                    Out at 3rd
                  </button>
                  <button
                    className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEventSelect('FOH')}
                  >
                    Out at Home
                  </button>
                </div>
              </div>

              {/* RBI Section */}
              <div className="relative group">
                <button className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full flex justify-between items-center text-black font-medium">
                  RBI <span>▸</span>
                </button>
                <div className="absolute left-full top-0 w-24 bg-white border rounded shadow-lg hidden group-hover:block">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full text-black font-medium"
                      onClick={() => handleEventSelect(`RBI${num}`)}
                    >
                      {num} RBI
                    </button>
                  ))}
                </div>
              </div>

              {/* Outs Section */}
              <div className="border-t border-gray-200"></div>
              {['K', 'ꓘ', 'FO', 'GO', 'LO', 'DP'].map(out => (
                <button
                  key={out}
                  className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full text-black font-medium"
                  onClick={() => handleEventSelect(out)}
                >
                  {out}
                </button>
              ))}

              {/* Other Section */}
              <div className="border-t border-gray-200"></div>
              <button
                className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full text-black font-medium"
                onClick={() => handleEventSelect('BB')}
              >
                BB
              </button>

              {/* Error Section */}
              <div className="relative group">
                <button className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full flex justify-between items-center text-black font-medium">
                  E <span>▸</span>
                </button>
                <div className="absolute left-full top-0 w-24 bg-white border rounded shadow-lg hidden group-hover:block">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i + 1}
                      className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full text-black font-medium"
                      onClick={() => handleEventSelect(`E${i + 1}`)}
                    >
                      E{i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {['FC', 'SAC'].map(other => (
                <button
                  key={other}
                  className="text-left px-2 py-1 text-sm hover:bg-gray-100 w-full text-black font-medium"
                  onClick={() => handleEventSelect(other)}
                >
                  {other}
                </button>
              ))}
            </div>
          )}
        </div>

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
              event: selectedEvent,
              outDetails: e.target.value,
              custom
            });
          }}
          disabled={!editable}
          style={inputStyle}
        />

        {/* Custom input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5 w-14"
          placeholder="Note"
          value={custom}
          onChange={(e) => {
            if (!editable) return;
            setCustom(e.target.value);
            onDataChange?.({
              event: selectedEvent,
              outDetails,
              custom: e.target.value
            });
          }}
          disabled={!editable}
          style={inputStyle}
        />
      </div>
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
