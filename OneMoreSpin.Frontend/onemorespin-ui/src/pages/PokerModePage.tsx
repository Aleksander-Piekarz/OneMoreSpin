import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PokerModeSelector from '../components/PokerModeSelector';
import '../styles/PokerModePage.css';
import '../styles/GameHeader.css';

const PokerModePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="poker-mode-page">
      <div className="poker-animated-bg">
        <div className="poker-floating-shape poker-shape-1"></div>
        <div className="poker-floating-shape poker-shape-2"></div>
        <div className="poker-floating-shape poker-shape-3"></div>
      </div>

      <header className="game-header">
        <div className="game-header-left">
          <button className="game-back-btn" onClick={() => navigate('/home')}>
            <i className="fas fa-arrow-left"></i>
            <span>{t('common.back')}</span>
          </button>
        </div>
        <div className="game-header-center">
          <div className="game-title">
            <span className="game-title-word">POKER</span>
          </div>
        </div>
        <div className="game-header-right">
        </div>
      </header>

      <main className="poker-mode-main">
        <h2 className="poker-select-title">{t('games.poker.selectMode')}</h2>
        <PokerModeSelector />
      </main>
    </div>
  );
};

export default PokerModePage;
