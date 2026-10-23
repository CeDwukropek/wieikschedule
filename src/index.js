import { AuthProvider } from "./features/auth/AuthProvider";
import React from 'react';
import ReactDOM from 'react-dom/client';
import "./styles/global.css";
import App from "./app/App";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
