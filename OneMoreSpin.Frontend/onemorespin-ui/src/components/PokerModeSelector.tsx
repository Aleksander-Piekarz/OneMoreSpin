import React from 'react';
import { useNavigate } from 'react-router-dom';
import cardsIcon from '../assets/img/cards.png';
// Dodaj tutaj ikonę dla multiplayer jeśli masz inną, np. żetony
// import chipsIcon from '../assets/img/chips.png';
import '../styles/PokerModeSelector.css';

const PokerModeSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="poker-mode-selector">
      {/* SINGLE PLAYER */}
      <div className="mode-panel single" onClick={() => navigate('/single-poker')}>
        <div className="panel-overlay"></div>
        <div className="mode-content">
          <div className="mode-icon-container">
             <img src={cardsIcon} alt="Single" className="mode-icon" />
          </div>
          <h2 className="mode-title">ROYAL POKER</h2>
          <p className="mode-description">
            Trening czyni mistrza. Graj przeciwko krupierowi, testuj strategie bez presji czasu.
          </p>
          <div className="mode-action">
            <button className="mode-play-btn">
              <i className="fas fa-user"></i> GRAJ TERAZ
            </button>
          </div>
        </div>
      </div>

      {/* MULTIPLAYER */}
      <div className="mode-panel multiplayer" onClick={() => navigate('/poker')}>
        <div className="panel-overlay"></div>
        <div className="mode-content">
          <div className="mode-icon-container">
             {/* Tu możesz dać inną ikonę */}
             <img src={cardsIcon} alt="Multi" className="mode-icon" style={{filter: 'hue-rotate(150deg)'}} />
          </div>
          <h2 className="mode-title">Texas Hold’em</h2>
          <p className="mode-description">
            Prawdziwe emocje. Dołącz do stołów z innymi graczami i walcz o najwyższe stawki.
          </p>
          <div className="mode-action">
            <button className="mode-play-btn">
              <i className="fas fa-users"></i> DOŁĄCZ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerModeSelector;