import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import BlackjackModeSelector from '../components/BlackjackModeSelector';
import '../styles/BlackjackModePage.css';
import '../styles/GameHeader.css';

const BlackjackModePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="bj-mode-page">
      <div className="bj-animated-bg">
        <div className="bj-floating-shape bj-shape-1"></div>
        <div className="bj-floating-shape bj-shape-2"></div>
        <div className="bj-floating-shape bj-shape-3"></div>
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
            <span className="game-title-word">BLACKJACK</span>
          </div>
        </div>
        <div className="game-header-right">
        </div>
      </header>

      <main className="bj-mode-main">
        <h2 className="bj-select-title">{t('games.blackjack.selectMode')}</h2>
        <BlackjackModeSelector />
      </main>
    </div>
  );
};

export default BlackjackModePage;
