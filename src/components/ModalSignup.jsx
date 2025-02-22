// src/components/ModalSignup.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ModalSignup({ onClose, role }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert(`Signed up as ${role}, check your email for confirmation.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#545e46] p-4 rounded-md shadow-md w-80">
        <h2 className="text-[#dbe0da] text-xl mb-2">{role} Signup</h2>
        <input
          className="w-full mb-2 p-2 rounded-md"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-2 p-2 rounded-md"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="nav-button w-full"
          onClick={handleSignup}
        >
          Sign Up
        </button>
        <button className="nav-button w-full mt-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ModalSignup;  // Ensure default export
