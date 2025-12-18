import { useNavigate } from 'react-router-dom';
import cardsIcon from '../assets/img/cards.png';
import '../styles/BlackjackModeSelector.css';

const BlackjackModeSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bj-mode-selector">
      {/* SINGLE PLAYER */}
      <div className="bj-mode-tile bj-single" onClick={() => navigate('/blackjack-single')}>
        <div className="bj-tile-shine"></div>
        <div className="bj-particles">
          <span className="bj-particle" style={{ left: '10%', animationDuration: '8s', animationDelay: '0s' }}>♠</span>
          <span className="bj-particle" style={{ left: '30%', animationDuration: '10s', animationDelay: '2s' }}>♣</span>
          <span className="bj-particle" style={{ left: '70%', animationDuration: '9s', animationDelay: '4s' }}>♠</span>
          <span className="bj-particle" style={{ left: '90%', animationDuration: '11s', animationDelay: '1s' }}>♣</span>
        </div>
        <div className="bj-tile-content">
          <div className="bj-icon-wrapper">
            <div className="bj-icon-bg"></div>
            <img src={cardsIcon} alt="Single" className="bj-tile-icon" />
          </div>
          <h2 className="bj-tile-title">Classic Blackjack</h2>
          <p className="bj-tile-description">
            Klasyczny blackjack. Graj sam przeciwko krupierowi i doskonał swoje umiejętności.
          </p>
          <button className="bj-tile-btn">
            <i className="fas fa-user"></i> Graj Solo
          </button>
        </div>
      </div>

      {/* MULTIPLAYER */}
      <div className="bj-mode-tile bj-multiplayer" onClick={() => navigate('/blackjack-lobby')}>
        <div className="bj-tile-shine"></div>
        <div className="bj-particles">
          <span className="bj-particle" style={{ left: '15%', animationDuration: '9s', animationDelay: '1s' }}>♥</span>
          <span className="bj-particle" style={{ left: '45%', animationDuration: '11s', animationDelay: '3s' }}>♦</span>
          <span className="bj-particle" style={{ left: '75%', animationDuration: '8s', animationDelay: '0s' }}>♥</span>
          <span className="bj-particle" style={{ left: '85%', animationDuration: '10s', animationDelay: '2s' }}>♦</span>
        </div>
        <div className="bj-tile-content">
          <div className="bj-icon-wrapper">
            <div className="bj-icon-bg"></div>
            <img src={cardsIcon} alt="Multi" className="bj-tile-icon" style={{ filter: 'hue-rotate(40deg) saturate(1.3)' }} />
          </div>
          <h2 className="bj-tile-title">Multiplayer 21</h2>
          <p className="bj-tile-description">
            Prawdziwe emocje przy stole! Dołącz do innych graczy i pokonaj krupiera razem.
          </p>
          <button className="bj-tile-btn">
            <i className="fas fa-users"></i> Dołącz do Stołu
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlackjackModeSelector;
