// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get or create a persistent device ID for this browser
const getDeviceId = () => {
  try {
    let id = localStorage.getItem('gct_device_id');
    if (!id) {
      id =
        'dev-' +
        Math.random().toString(36).slice(2) +
        Date.now().toString(36);
      localStorage.setItem('gct_device_id', id);
    }
    return id;
  } catch {
    return 'dev-unknown';
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } else {
      setToken(null);
      setUser(null);
    }

    setLoading(false);
  }, []);

  // Internal — write token + user everywhere
  const persistSession = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // ─────────────────────────────────────────────────────
  //  Login step 1: credentials
  //
  //  Returns either:
  //    { requiresOTP: true, attemptId, maskedEmail }
  //    { requiresOTP: false, user }
  // ─────────────────────────────────────────────────────
  const loginStep = async (username, password) => {
    const deviceId = getDeviceId();

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, deviceId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.requiresOTP) {
      return {
        requiresOTP: true,
        attemptId: data.attemptId,
        maskedEmail: data.maskedEmail,
      };
    }

    if (data.token && data.user) {
      persistSession(data.token, data.user);
      return { requiresOTP: false, user: data.user };
    }

    throw new Error('Unexpected response from server');
  };

  // ─────────────────────────────────────────────────────
  //  Login step 2: OTP verification
  // ─────────────────────────────────────────────────────
  const verifyOTP = async (attemptId, otp) => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Verification failed');
    }

    if (!data.token || !data.user) {
      throw new Error('Unexpected response from server');
    }

    persistSession(data.token, data.user);
    return data.user;
  };

  // ─────────────────────────────────────────────────────
  //  Legacy single-step login (kept for backward compat)
  //  If the backend asks for OTP, this will throw so the
  //  caller knows to switch to loginStep.
  // ─────────────────────────────────────────────────────
  const login = async (username, password) => {
    const result = await loginStep(username, password);
    if (result.requiresOTP) {
      throw new Error('OTP required');
    }
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginStep,
        verifyOTP,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}