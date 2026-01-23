import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import slotMachineIcon from "../assets/img/slot-machine.png";
import rouletteIcon from "../assets/img/roulette.png";
import blackjackIcon from "../assets/img/black-jack.png";
import cardsIcon from "../assets/img/cards.png";
import "../styles/HomePage.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      navigate("/");
      return;
    }

    checkAdminStatus();
  }, [navigate]);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin/users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const preloadImages = () => {
      const images = [
        slotMachineIcon,
        rouletteIcon,
        blackjackIcon,
        cardsIcon
      ];
      
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    
    preloadImages();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Logout failed:', response.status);
      }
    } catch (err) {
      console.error('Logout API call failed:', err);
    }
    
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    navigate("/");
  };

  const tiles = [
    { 
      id: 1, 
      title: t('nav.slots').toUpperCase(), 
      iconImage: slotMachineIcon,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      particles: ["💎", "🍒", "⭐", "7️⃣", "💰", "🎰"],
      onClick: () => navigate("/slots")
    },
    { 
      id: 2, 
      title: t('nav.roulette').toUpperCase(), 
      iconImage: rouletteIcon,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      particles: ["🔴", "⚫", "💰", "🎲", "💵", "🎯"],
      onClick: () => navigate("/roulette")
    },
    { 
      id: 3, 
      title: t('nav.blackjack').toUpperCase(), 
      iconImage: blackjackIcon,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      particles: ["♠️", "♥️", "♦️", "♣️", "🃏", "🎴"],
      onClick: () => navigate("/blackjack")
    },
    { 
      id: 4, 
      title: t('nav.poker').toUpperCase(), 
      iconImage: cardsIcon,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      particles: ["🃏", "💵", "🏆", "♦️", "♠️", "💎"],
      onClick: () => navigate('/poker-mode')
    },
  ];

  return (
    <div className="home-page-new">
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      <header className="home-header">
        <div className="home-header-left">
          <LanguageSwitcher />
        </div>
        
        <div className="home-header-center">
          <h1 className="home-page-title">
            <span className="title-word">ONE</span>
            <span className="title-word">MORE</span>
            <span className="title-word">SPIN</span>
          </h1>
        </div>

        <div className="home-header-right">
          <button className="user-icon-btn" onClick={() => navigate('/profile')}> 
            <div className="icon-wrapper">
              <i className="fas fa-user"></i>
              <div className="icon-glow"></div>
            </div>
          </button>

          <button 
            className={`hamburger-menu-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className={`menu-dropdown ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          {isAdmin && (
            <button className="menu-item admin" onClick={() => {
              navigate('/admin');
              setIsMenuOpen(false);
            }}>
              <i className="fas fa-shield-alt"></i>
              <span>{t('common.admin')}</span>
            </button>
          )}
          <button className="menu-item logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>{t('common.logout')}</span>
          </button>
        </div>
      </div>

      <main className="game-tiles-container">
        <div className="game-tiles-grid">
          {tiles.map((tile, index) => (
              <div 
                key={tile.id} 
                className={`game-tile ${hoveredTile === tile.id ? 'hovered' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                  background: tile.gradient 
                }}
                onMouseEnter={() => setHoveredTile(tile.id)}
                onMouseLeave={() => setHoveredTile(null)}
                onClick={tile.onClick}
              >
                {hoveredTile === tile.id && (
                  <div className="particles-container">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="particle"
                        style={{ 
                          animationDelay: `${i * 0.15}s`,
                          left: `${Math.random() * 90 + 5}%`,
                          animationDuration: `${2 + Math.random() * 1}s`
                        }}
                      >
                        {tile.particles[i % tile.particles.length]}
                      </div>
                    ))}
                  </div>
                )}

                <div className="tile-shine"></div>
                
                <div className="tile-content">
                  <div className="tile-icon-wrapper">
                    <div className="icon-bg"></div>
                    <img 
                      src={tile.iconImage} 
                      alt={tile.title} 
                      className="tile-icon-image" 
                    />
                  </div>
                  <h3 className="tile-title">{tile.title}</h3>
                  
                  <div className="tile-play-btn">
                    <i className="fas fa-play"></i>
                    <span>{t('common.play').toUpperCase()}</span>
                  </div>
                </div>

                <div className="tile-border">
                  <div className="border-line border-top"></div>
                  <div className="border-line border-right"></div>
                  <div className="border-line border-bottom"></div>
                  <div className="border-line border-left"></div>
                </div>
              </div>
            ))}
          </div>
      </main>
    </div>
  );
};

export default HomePage;