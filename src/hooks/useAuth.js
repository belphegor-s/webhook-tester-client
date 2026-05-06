import { useState, useCallback } from 'react';
import { getToken, login as doLogin, clearToken } from '../lib/auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());

  const login = useCallback(async (password) => {
    await doLogin(password);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
