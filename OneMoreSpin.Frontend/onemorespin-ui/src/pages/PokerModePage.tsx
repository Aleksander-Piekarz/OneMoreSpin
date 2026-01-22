import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PokerModeSelector from '../components/PokerModeSelector';
import '../styles/PokerModePage.css';

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

      <header className="poker-mode-header">
        <button className="poker-back-btn" onClick={() => navigate('/home')}>
          <i className="fas fa-arrow-left"></i>
          <span>{t('common.back')}</span>
        </button>

        <h1 className="poker-page-title">
          <span className="poker-title-word">POKER</span>
        </h1>
      </header>

      <main className="poker-mode-main">
        <h2 className="poker-select-title">{t('games.poker.selectMode')}</h2>
        <PokerModeSelector />
      </main>
    </div>
  );
};

export default PokerModePage;
