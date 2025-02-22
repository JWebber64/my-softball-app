import React from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const AuthPage = () => {
  return (
    <div className="auth-container">
      <h1>Sign In</h1>
      <GoogleSignInButton />
    </div>
  );
};

export default AuthPage;
