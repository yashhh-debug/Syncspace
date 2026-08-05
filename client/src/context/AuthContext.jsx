import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = 'http://localhost:1234/api/auth';
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/register`, { name, email, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const recordActivity = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.post(
        `${API}/activity`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.activity) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                activity: res.data.activity,
                streak: res.data.streak,
                maxStreak: res.data.maxStreak,
                totalActiveDays: res.data.totalActiveDays,
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Failed to record activity:', err);
    }
  };

  console.log('AuthContext user:', user);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, recordActivity }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);