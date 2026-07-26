import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, tokenStorage } from '../services/api';
import { ensureDashboardEntry } from '../utils/dashboardAccess';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStorage.getUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncSessionFromStorage = () => {
      const access = tokenStorage.getAccess();
      if (!access) {
        setUser(null);
        return;
      }
      setUser(tokenStorage.getUser());
    };

    const onStorage = (event) => {
      if (
        event.key === null
        || event.key === 'access_token'
        || event.key === 'refresh_token'
        || event.key === 'user'
      ) {
        syncSessionFromStorage();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncSessionFromStorage();
      }
    };

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      tokenStorage.setTokens({
        access: data.access,
        refresh: data.refresh,
        user: data.user,
      });
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      /* ignore logout errors */
    } finally {
      tokenStorage.clear();
      ensureDashboardEntry();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && tokenStorage.getAccess()),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
