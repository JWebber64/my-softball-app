import React from 'react';

const TestComponent = () => {
  console.log("TestComponent is rendering");
  
  return (
    <div className="p-8 bg-blue-500 text-white">
      <h1 className="text-3xl font-bold">Test Component</h1>
      <p>This is a test component to check if routing is working.</p>
    </div>
  );
};

export default TestComponent;