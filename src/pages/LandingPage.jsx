import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import GoogleSignInButton from '../components/GoogleSignInButton';
import ModalSignup from '../components/ModalSignup';
import ModalLogin from '../components/ModalLogin';
import ModalResetPassword from '../components/ModalResetPassword';

const LandingPage = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const handleSignupClick = (role) => {
    setSelectedRole(role);
    setShowSignup(true);
  };

  const handleLoginClick = (role) => {
    setSelectedRole(role);
    setShowLogin(true);
  };

  const roles = [
    { title: "User Login", role: "User" },
    { title: "Team Admin Login", role: "Team Admin" },
    { title: "League Admin Login", role: "League Admin" }
  ];

  return (
    <>
      <div className="welcome-section">
        <div className="welcome-card full-width">
          <h2>Welcome to Diamond Data</h2>
          <p>Track your softball team's stats and performance</p>
        </div>
        
        <div className="login-cards">
          {roles.map((item) => (
            <div key={item.role} className="welcome-card">
              <h2>{item.title}</h2>
              <div className="auth-buttons">
                <GoogleSignInButton role={item.role} />
                <button 
                  className="nav-button email-auth" 
                  onClick={() => handleSignupClick(item.role)}
                >
                  Email Signup
                </button>
                <button 
                  className="nav-button email-auth" 
                  onClick={() => handleLoginClick(item.role)}
                >
                  Email Login
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSignup && (
        <ModalSignup onClose={() => setShowSignup(false)} role={selectedRole} />
      )}
      {showLogin && (
        <ModalLogin onClose={() => setShowLogin(false)} role={selectedRole} />
      )}
      {showReset && (
        <ModalResetPassword onClose={() => setShowReset(false)} />
      )}
    </>
  );
};

export default LandingPage;
