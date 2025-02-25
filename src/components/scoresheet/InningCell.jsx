import React from 'react';
import PropTypes from 'prop-types';

const InningCell = ({ 
  data = {}, 
  onDataChange, 
  editable = true 
}) => {
  const { event = '', outDetails = '', custom = '' } = data;
  
  const handleEventChange = (newEvent) => {
    if (!editable) return;
    onDataChange?.({
      event: newEvent,
      outDetails,
      custom
    });
  };
  
  const handleOutDetailsChange = (e) => {
    if (!editable) return;
    onDataChange?.({
      event,
      outDetails: e.target.value,
      custom
    });
  };
  
  const handleCustomChange = (e) => {
    if (!editable) return;
    onDataChange?.({
      event,
      outDetails,
      custom: e.target.value
    });
  };

  return (
    <div className="flex w-full h-full items-center" style={{ gap: "0.75rem" }}>
      {/* Left column with diamond */}
      <div className="flex flex-col items-center" style={{ width: "1.5rem", height: "5.5rem" }}>
        {/* RBI text at top */}
        <div className="text-xs text-center mb-1">
          {event.startsWith('RBI') ? event : ''}
        </div>
        
        {/* Centered diamond */}
        <div
          className="relative self-center"
          style={{ 
            width: "1.5rem",
            height: "1.5rem",
            transform: "rotate(45deg)",
            border: "1px solid black",
            marginTop: "auto",
            marginBottom: "auto"
          }}
        />
        
        {/* Space below diamond */}
        <div className="mt-1"></div>
      </div>
      
      {/* Right column with inputs */}
      <div className="flex flex-col space-y-2" style={{ width: "3.5rem" }}>
        {/* Event input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5 w-14"
          placeholder="Event"
          value={event}
          onChange={(e) => handleEventChange(e.target.value)}
          disabled={!editable}
        />
        
        {/* Out input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5 w-14"
          placeholder="Out"
          value={outDetails}
          onChange={handleOutDetailsChange}
          disabled={!editable}
        />
        
        {/* Custom input */}
        <input
          type="text"
          className="border text-[0.75rem] text-center p-0.5 w-14"
          placeholder="Note"
          value={custom}
          onChange={handleCustomChange}
          disabled={!editable}
        />
      </div>
    </div>
  );
};

InningCell.propTypes = {
  data: PropTypes.shape({
    event: PropTypes.string,
    outDetails: PropTypes.string,
    custom: PropTypes.string
  }),
  onDataChange: PropTypes.func,
  editable: PropTypes.bool
};

export default InningCell;