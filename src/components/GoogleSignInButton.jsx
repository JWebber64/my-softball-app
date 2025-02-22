import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { signInWithGoogle } from '../Auth/googleSignIn';

const GoogleSignInButton = ({ role }) => {
  const { showNotification } = useNotification();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        showNotification(`Successfully signed in as ${role}`, 'success');
      }
    } catch (error) {
      showNotification('Failed to sign in with Google', 'error');
    }
  };

  return (
    <button 
      className="google-sign-in-button"
      onClick={handleGoogleSignIn}
      disabled={false} // You can control this with a prop or state
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '0 16px',
        height: '40px',
        backgroundColor: 'black',
        color: 'white',
        border: 'none',
        borderRadius: '1rem',
        fontSize: '14px',
        fontFamily: 'Roboto, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: 'scale(1)',  // Starting scale for click effect
      }}
      onMouseOver={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.backgroundColor = '#333';
        }
      }}
      onMouseOut={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.backgroundColor = 'black';
        }
      }}
      onMouseDown={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.transform = 'scale(0.95)';
        }
      }}
      onMouseUp={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="white" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      </svg>
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;
