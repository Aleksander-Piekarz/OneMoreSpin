import React from 'react';
import '../styles/DemoToggle.css';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
};

const DemoToggle: React.FC<Props> = ({ checked, onChange }) => {
  return (
    <button
      className={`demo-toggle ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      title={checked ? 'Demo włączone' : 'Włącz demo'}
    >
      <span className="demo-pill">
        <span className="demo-dot" />
        <span className="demo-label">DEMO</span>
      </span>
    </button>
  );
};

export default DemoToggle;
