import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { useStore } from './store';

// Expose theme switcher helper for demo / headless automation
if (typeof window !== 'undefined') {
  (window as any).__EOSS_STORE__ = useStore;
  (window as any).__EOSS_SET_THEME__ = (theme: 'aurora' | 'ocean' | 'graphite') => {
    useStore.getState().setEOSSTheme(theme);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
