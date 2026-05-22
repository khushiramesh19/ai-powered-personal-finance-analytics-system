import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load stored session on startup
    const storedToken = localStorage.getItem('centra_token');
    const storedUser = localStorage.getItem('centra_user');
    const storedGuest = localStorage.getItem('centra_is_guest');

    if (storedGuest === 'true') {
      setIsGuest(true);
      setUser(JSON.parse(storedUser || '{"name": "Khushi Ramesh", "email": "khushi@example.com"}'));
    } else if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      localStorage.setItem('centra_token', data.token);
      localStorage.setItem('centra_user', JSON.stringify(data.user));
      localStorage.removeItem('centra_is_guest');

      setToken(data.token);
      setUser(data.user);
      setIsGuest(false);
      return true;
    } catch (err) {
      console.warn('API Login failed. If you intended to use Mock Guest Login, click Guest Mode.', err);
      setError(err.message || 'API connection failed. Please try Guest Mode.');
      setLoading(false);
      return false;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      localStorage.setItem('centra_token', data.token);
      localStorage.setItem('centra_user', JSON.stringify(data.user));
      localStorage.removeItem('centra_is_guest');

      setToken(data.token);
      setUser(data.user);
      setIsGuest(false);
      return true;
    } catch (err) {
      setError(err.message || 'API connection failed. Please try Guest Mode.');
      setLoading(false);
      return false;
    }
  };

  const loginAsGuest = () => {
    setLoading(true);
    const guestUser = { id: 'guest_123', name: 'Khushi Ramesh', email: 'khushi@example.com' };
    localStorage.setItem('centra_is_guest', 'true');
    localStorage.setItem('centra_user', JSON.stringify(guestUser));
    localStorage.removeItem('centra_token');

    setUser(guestUser);
    setIsGuest(true);
    setToken(null);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('centra_token');
    localStorage.removeItem('centra_user');
    localStorage.removeItem('centra_is_guest');
    setUser(null);
    setToken(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isGuest, loading, error, login, register, loginAsGuest, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
