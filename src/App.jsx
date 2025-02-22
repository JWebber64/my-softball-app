import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import TeamStatsPage from './pages/TeamStatsPage';
import ScoreSheetsPage from './pages/ScoreSheetsPage';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <div className="page-container">
        <div className="content-wrap">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/team-stats" element={<TeamStatsPage />} />
              <Route path="/score-sheets" element={<ScoreSheetsPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </NotificationProvider>
  );
}

export default App;

