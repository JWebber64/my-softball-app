import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import TestPage from '../pages/TestPage';

// Import pages
import LandingPage from '../pages/LandingPage';
import ScoreSheetsPage from '../pages/ScoreSheetsPage';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="/test-page" element={<TestPage />} />
        <Route path="/scoresheets" element={<ScoreSheetsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
