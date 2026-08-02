import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides:
 * - user: current logged-in user object (or null)
 * - login: save user data to state + localStorage
 * - logout: clear user data
 * - loading: true while checking persisted auth
 */
export function AuthProvider({ children }) {
  // Initialize from localStorage synchronously — avoids setState in effect
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading] = useState(false);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
