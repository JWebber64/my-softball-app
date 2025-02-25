import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <button 
        className="nav-button"
        onClick={() => navigate('/')}
      >
        Return Home
      </button>
    </div>
  );
};

export default NotFound;
