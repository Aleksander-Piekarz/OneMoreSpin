import React, { useState } from "react";
import AuthModal, { type AuthMode } from "./AuthModal";

const MainPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("register");

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="main-page">
      <header className="top-bar">
        <div className="user-icon">
          <i className="fa-regular fa-user"></i>
        </div>
        <button
          className="top-login-btn"
          onClick={() => openAuth("login")}
        >
          LOG IN
        </button>
      </header>

      <main className="content">
        <div className="image-container">
          <img src="img/casino-logo.png" alt="casino logo" />
        </div>

        <h1 className="title">ONE MORE SPIN</h1>
        <p className="subtitle">BEST ONLINE CASINO</p>

        <button
          className="create-account-btn"
          onClick={() => openAuth("register")}
        >
          CREATE ACCOUNT
        </button>
        
      </main>
      {showAuth && (
        <AuthModal mode={authMode} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
};

export default MainPage;
