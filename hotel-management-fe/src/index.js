import { h, render } from 'preact';
import { ThemeProvider } from './context/ThemeContext';
import App from './components/App';
import './styles/index.css';

// Apply saved theme before first paint to avoid flash
try {
  if (localStorage.getItem('hms-theme') === 'blue') {
    document.documentElement.classList.add('theme-blue');
  }
} catch {}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  document.getElementById('app')
);
