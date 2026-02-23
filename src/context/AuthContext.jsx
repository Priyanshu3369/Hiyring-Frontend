// context/AuthContext.jsx
// Global authentication state using React Context + useReducer.
// Any component can call useAuth() to read the current user or call auth actions.
// Token and user are persisted in localStorage so they survive page refreshes.

import { createContext, useContext, useReducer, useEffect } from "react";
import { loginUser, signupUser, logoutUser } from "../services/authService";

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Reducer ────────────────────────────────────────────────────────────────
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };

    case "AUTH_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case "AUTH_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "LOGOUT":
      return { ...initialState, user: null, token: null };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Keep localStorage in sync whenever token/user changes
  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem("token", state.token);
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [state.token, state.user]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    dispatch({ type: "AUTH_START" });
    try {
      const data = await loginUser(email, password);
      dispatch({ type: "AUTH_SUCCESS", payload: data });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  };

  const signup = async (email, password, firstName, lastName) => {
    dispatch({ type: "AUTH_START" });
    try {
      const data = await signupUser(email, password, firstName, lastName);
      dispatch({ type: "AUTH_SUCCESS", payload: data });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Signup failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); // Notify backend
    } catch {
      // Even if backend call fails, we still clear client-side state
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.token,
    login,
    signup,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────
// Convenience hook so components don't import useContext + AuthContext separately
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;