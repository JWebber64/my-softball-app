import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="page-container">
      <Header />
      
      <main className="content-wrap">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
