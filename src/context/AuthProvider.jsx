import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '@/services/auth.js';
import { clearSession, readUser, saveSession } from '@/services/session.js';

const AuthContext = createContext(null);

// One auth state for the whole app, so the sidebar, top bar and route guards can
// never disagree about who is signed in.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readUser);

  const signIn = async (credentials) => {
    const response = await authApi.login(credentials);
    const session = response.data.data;

    saveSession(session);
    setUser(session.user);
    return session.user;
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // The stored session is dropped even if the server cannot be reached.
    }

    clearSession();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), signIn, signOut }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
