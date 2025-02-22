// src/components/ModalResetPassword.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ModalResetPassword({ onClose }) {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for a reset link.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#545e46] p-4 rounded-md shadow-md w-80">
        <h2 className="text-[#dbe0da] text-xl mb-2">Reset Password</h2>
        <input
          className="w-full mb-2 p-2 rounded-md"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="nav-button w-full"
          onClick={handleReset}
        >
          Send Reset Link
        </button>
        <button className="nav-button w-full mt-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ModalResetPassword;  // Ensure default export
