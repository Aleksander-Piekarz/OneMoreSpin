import React from 'react';
import ReactDOM from 'react-dom/client';
import MainPage from './components/MainPage';
import './styles/main.css';

const rootElement = document.getElementById('react-root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <MainPage />
    </React.StrictMode>
  );
}
