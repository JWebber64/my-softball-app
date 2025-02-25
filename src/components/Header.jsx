import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header-wrapper">
      <header className="header">
        <div className="logo-container">
          <img src="/logo.svg" alt="Diamond Data Logo" className="logo" />
          <div className="site-title">Diamond Data</div>
        </div>
        <div className="nav-buttons-container">
          <div className="nav-buttons">
            <div className="nav-row">
              <button className="nav-button" onClick={() => navigate('/team-info')}>
                Team Info
              </button>
              <button className="nav-button" onClick={() => navigate('/team-admin')}>
                Team Admin
              </button>
              <button className="nav-button" onClick={() => navigate('/team-stats')}>
                Team Stats
              </button>
            </div>
            <div className="nav-row">
              <button className="nav-button" onClick={() => navigate('/league-info')}>
                League Info
              </button>
              <button className="nav-button" onClick={() => navigate('/league-admin')}>
                League Admin
              </button>
              <button className="nav-button" onClick={() => navigate('/scoresheets')}>
                Score Sheets
              </button>
            </div>
            <div className="nav-row">
              <button className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
