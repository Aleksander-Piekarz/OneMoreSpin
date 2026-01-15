import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import cardsIcon from '../assets/img/cards.png';
import '../styles/PokerModeSelector.css';

const PokerModeSelector: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="pk-mode-selector">
      {/* SINGLE PLAYER */}
      <div className="pk-mode-tile pk-single" onClick={() => navigate('/single-poker')}>
        <div className="pk-tile-shine"></div>
        <div className="pk-particles">
          <span className="pk-particle" style={{ left: '10%', animationDuration: '8s', animationDelay: '0s' }}>♠</span>
          <span className="pk-particle" style={{ left: '30%', animationDuration: '10s', animationDelay: '2s' }}>♣</span>
          <span className="pk-particle" style={{ left: '70%', animationDuration: '9s', animationDelay: '4s' }}>♠</span>
          <span className="pk-particle" style={{ left: '90%', animationDuration: '11s', animationDelay: '1s' }}>♣</span>
        </div>
        <div className="pk-tile-content">
          <div className="pk-icon-wrapper">
            <div className="pk-icon-bg"></div>
            <img src={cardsIcon} alt="Single" className="pk-tile-icon" />
          </div>
          <h2 className="pk-tile-title">{t('games.poker.royalPoker')}</h2>
          <p className="pk-tile-description">
            {t('games.poker.royalDescription')}
          </p>
          <button className="pk-tile-btn">
            <i className="fas fa-user"></i> {t('games.poker.playSolo')}
          </button>
        </div>
      </div>

      {/* MULTIPLAYER */}
      <div className="pk-mode-tile pk-multiplayer" onClick={() => navigate('/poker')}>
        <div className="pk-tile-shine"></div>
        <div className="pk-particles">
          <span className="pk-particle" style={{ left: '15%', animationDuration: '9s', animationDelay: '1s' }}>♥</span>
          <span className="pk-particle" style={{ left: '45%', animationDuration: '11s', animationDelay: '3s' }}>♦</span>
          <span className="pk-particle" style={{ left: '75%', animationDuration: '8s', animationDelay: '0s' }}>♥</span>
          <span className="pk-particle" style={{ left: '85%', animationDuration: '10s', animationDelay: '2s' }}>♦</span>
        </div>
        <div className="pk-tile-content">
          <div className="pk-icon-wrapper">
            <div className="pk-icon-bg"></div>
            <img src={cardsIcon} alt="Multi" className="pk-tile-icon" style={{ filter: 'hue-rotate(150deg) saturate(1.3)' }} />
          </div>
          <h2 className="pk-tile-title">{t('games.poker.texasHoldem')}</h2>
          <p className="pk-tile-description">
            {t('games.poker.texasDescription')}
          </p>
          <button className="pk-tile-btn">
            <i className="fas fa-users"></i> {t('games.poker.joinTable')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokerModeSelector;
