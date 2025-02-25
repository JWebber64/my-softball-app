import React from 'react';

// This is a test component with a unique timestamp
// Current timestamp: 2023-06-15-12-34-56
const TestComponent = () => {
  return (
    <div style={{
      border: '5px solid purple',
      padding: '20px',
      margin: '20px',
      backgroundColor: 'lightgreen',
      color: 'black',
      fontSize: '24px',
      textAlign: 'center'
    }}>
      THIS IS A TEST COMPONENT
      <br />
      Created at: {new Date().toISOString()}
    </div>
  );
};

export default TestComponent;