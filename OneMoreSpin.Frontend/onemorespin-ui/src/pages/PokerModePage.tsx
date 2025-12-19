import { useNavigate } from 'react-router-dom';
import PokerModeSelector from '../components/PokerModeSelector';
import '../styles/PokerModePage.css';

const PokerModePage: React.FC = () => {
  const navigate = useNavigate();

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
          <span>POWRÓT</span>
        </button>

        <h1 className="poker-page-title">
          <span className="poker-title-word">POKER</span>
        </h1>

        <div className="poker-header-spacer"></div>
      </header>

      <main className="poker-mode-main">
        <h2 className="poker-select-title">Wybierz tryb gry</h2>
        <PokerModeSelector />
      </main>
    </div>
  );
};

export default PokerModePage;
