import { h, createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';

const STORAGE_KEY = 'hms-theme';
const VALID_THEMES = ['amber', 'blue'];
const DEFAULT_THEME = VALID_THEMES.includes(process.env.REACT_APP_THEME)
  ? process.env.REACT_APP_THEME
  : 'amber';

const ThemeContext = createContext({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    if (theme === 'blue') {
      document.documentElement.classList.add('theme-blue');
    } else {
      document.documentElement.classList.remove('theme-blue');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
