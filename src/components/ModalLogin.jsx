// src/components/ModalLogin.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ModalLogin({ onClose, role }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      alert(error.message);
    } else {
      alert(`Logged in as ${role}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#545e46] p-4 rounded-md shadow-md w-80">
        <h2 className="text-[#dbe0da] text-xl mb-2">{role} Login</h2>
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
          onClick={handleLogin}
        >
          Login
        </button>
        <button className="nav-button w-full mt-2" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ModalLogin;  // Ensure default export
