import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("instagram_token"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for token or error in URL when component mounts
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const errorFromUrl = urlParams.get("error");

    if (errorFromUrl) {
      setError(decodeURIComponent(errorFromUrl));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setError(null);
      localStorage.setItem("instagram_token", tokenFromUrl);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Update authentication status
    setIsAuthenticated(!!token);
  }, [token]);

  const login = () => {
    window.location.href =
      "https://insta-back-sh0s.onrender.com/api/instagram/login";
  };

  const logout = () => {
    localStorage.removeItem("instagram_token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, login, logout, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
