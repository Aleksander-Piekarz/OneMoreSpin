import { useNavigate } from 'react-router-dom';
import BlackjackModeSelector from '../components/BlackjackModeSelector';
import { GameHelpModal, BLACKJACK_HELP } from '../components/GameHelpModal';
import '../styles/BlackjackModePage.css';

const BlackjackModePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bj-mode-page">
      <div className="bj-animated-bg">
        <div className="bj-floating-shape bj-shape-1"></div>
        <div className="bj-floating-shape bj-shape-2"></div>
        <div className="bj-floating-shape bj-shape-3"></div>
      </div>

      <header className="bj-mode-header">
        <button className="bj-back-btn" onClick={() => navigate('/home')}>
          <i className="fas fa-arrow-left"></i>
          <span>POWRÓT</span>
        </button>

        <h1 className="bj-page-title">
          <span className="bj-title-word">BLACK</span>
          <span className="bj-title-word">JACK</span>
        </h1>

        <GameHelpModal content={BLACKJACK_HELP} position="header" />
      </header>

      <main className="bj-mode-main">
        <h2 className="bj-select-title">Wybierz tryb gry</h2>
        <BlackjackModeSelector />
      </main>
    </div>
  );
};

export default BlackjackModePage;
