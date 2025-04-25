import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for user authentication and management
 * Provides methods for login, registration, logout, and fetching user data
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

  /**
   * Fetch the current user's profile
   */
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/users/me`, {
        method: "GET",
        credentials: "include", // Important for cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /**
   * Login user with email and password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/users/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
    } catch (err) {
      setError(err.message);
      console.error("Error during logout:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    if (!user) return false;
    return (
      user.roles === role ||
      (Array.isArray(user.roles) && user.roles.includes(role))
    );
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => hasRole("admin");

  /**
   * Fetch user data on mount
   */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated: !!user,
    isAdmin,
    hasRole,
  };
}

export default useUser;
