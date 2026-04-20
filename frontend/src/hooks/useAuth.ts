import { useState, useEffect, useCallback } from 'react';
import { User, getStoredUser, verifyToken, logout as doLogout, getSessionExpiry } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(getSessionExpiry());

  useEffect(() => {
    verifyToken().then(u => {
      setUser(u);
      setSessionExpiry(getSessionExpiry());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const logout = useCallback(() => { doLogout(); setUser(null); }, []);
  const refreshUser = useCallback(() => {
    setUser(getStoredUser());
    setSessionExpiry(getSessionExpiry());
  }, []);

  return { user, loading, logout, refreshUser, sessionExpiry };
}
