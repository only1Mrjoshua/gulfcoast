// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import RestrictedModal from '../components/RestrictedModal';

const AuthContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Key used to hand a message off to the next page load after auto-logout
const RESTRICTED_NOTICE_KEY = 'gct_restricted_notice';

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

  const [restriction, setRestriction] = useState({
    active: false,
    message: '',
  });

  // ── Restore user from localStorage on page refresh ─────────
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

  // ── Internal — write token + user everywhere ───────────────
  const persistSession = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // ── Helper: build an error that carries the restricted flag ─
  const makeLoginError = (data, fallback = 'Login failed') => {
    const err = new Error(data?.error || fallback);
    if (data?.restricted) {
      err.restricted = true;
      err.restrictedReason =
        data.restrictedReason || data.error || '';
    }
    return err;
  };

  // ─────────────────────────────────────────────────────
  //  Login step 1: credentials
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
      throw makeLoginError(data);
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
      throw makeLoginError(data, 'Verification failed');
    }

    if (!data.token || !data.user) {
      throw new Error('Unexpected response from server');
    }

    persistSession(data.token, data.user);
    return data.user;
  };

  // ─────────────────────────────────────────────────────
  //  Legacy single-step login
  // ─────────────────────────────────────────────────────
  const login = async (username, password) => {
    const result = await loginStep(username, password);
    if (result.requiresOTP) {
      throw new Error('OTP required');
    }
    return result.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setRestriction({ active: false, message: '' });
  }, []);

  // ─────────────────────────────────────────────────────
  //  Restriction controls
  // ─────────────────────────────────────────────────────
  const triggerRestriction = useCallback((message = '') => {
    setRestriction({
      active: true,
      message:
        message ||
        'Your account has been temporarily restricted. Please visit our physical office at  200 St Charles Ave, New Orleans, LA 70130 to rectify the issue.',
    });
  }, []);

  const clearRestriction = useCallback(() => {
    setRestriction({ active: false, message: '' });
  }, []);

  const handleRestrictionExpire = useCallback(() => {
    try {
      localStorage.setItem(
        RESTRICTED_NOTICE_KEY,
        restriction.message ||
          'Your account has been restricted. Please visit the physical branch for rectification.'
      );
    } catch {
      /* ignore */
    }

    logout();
    window.location.href = '/';
  }, [restriction.message, logout]);

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
        triggerRestriction,
        clearRestriction,
        restricted: !!user?.restricted,
      }}
    >
      {children}

      {restriction.active && (
        <RestrictedModal
          message={restriction.message}
          onExpire={handleRestrictionExpire}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { RESTRICTED_NOTICE_KEY };