import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./styles/global.css";  // Updated import path

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>  {/* ✅ Provides authentication across the app */}
      <BrowserRouter>  {/* ✅ Wraps entire app inside the Router */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
