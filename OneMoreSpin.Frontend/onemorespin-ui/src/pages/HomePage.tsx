import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/");
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title">Strona główna</h1>
        {user && (
          <p className="home-user-info">
            Witaj, {user.email || "Użytkowniku"}!
          </p>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Wyloguj się
        </button>
      </div>
    </div>
  );
};

export default HomePage;
