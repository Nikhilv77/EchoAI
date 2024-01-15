import React, { createContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [cookies, setCookie] = useCookies(['theme']);
  const [theme, setTheme] = useState("dark");
  const [isSSR, setIsSSR] = useState(true);

  const toggleDark = () => {
    setCookie('theme', 'dark', { path: '/' });
    setTheme('dark');
  };

  const toggleLight = () => {
    setCookie('theme', 'light', { path: '/' });
    setTheme('light');
  };

  useEffect(() => {
    setIsSSR(false); 
    const storedTheme = cookies.theme || 'dark';
    setTheme(storedTheme);
  }, [cookies]);

  return (
    <ThemeContext.Provider value={{ theme, toggleDark, toggleLight }}>
      {!isSSR && <div className={`${theme} animation`}>{children}</div>}
    </ThemeContext.Provider>
  );
};
