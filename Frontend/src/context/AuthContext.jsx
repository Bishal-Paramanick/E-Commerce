import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, userApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loading, setLoading] = useState(() => !!sessionStorage.getItem("token"));

  // ── Fetch full profile (addresses etc.) ──────────────────────────────────
  const fetchProfile = useCallback(async () => {
    const currentToken = sessionStorage.getItem("token");
    if (!currentToken) return;
    setLoadingProfile(true);
    try {
      const res = await userApi.getProfile();
      setProfile(res.data);
      if (res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // ── Validate Session with Backend on App Startup ──────────────────────────
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = sessionStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        // Verify against backend profile endpoint
        const res = await userApi.getProfile();
        setUser(res.data);
        setProfile(res.data);
      } catch (err) {
        // If server was restarted, down, or token expired (401/403/Network Error):
        console.warn("Server restarted or session expired. Resetting authentication.");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("jwt_token");
        sessionStorage.removeItem("auth_user");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_user");
        setToken(null);
        setUser(null);
        setProfile(null);
        window.dispatchEvent(new CustomEvent("auth:logout"));
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { token: jwt, username, role } = res.data;
    const userData = { username, role };
    sessionStorage.setItem("token", jwt);
    sessionStorage.setItem("user", JSON.stringify(userData));
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(jwt);
    setUser(userData);
    fetchProfile();
    return res.data;
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (payload) => {
    const res = await authApi.register(payload);
    // If backend returns JWT directly in registration response
    if (res.data?.token) {
      const { token: jwt, username, role } = res.data;
      const userData = { username, role: role || "ROLE_USER" };
      sessionStorage.setItem("token", jwt);
      sessionStorage.setItem("user", JSON.stringify(userData));
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(jwt);
      setUser(userData);
      fetchProfile();
      return res.data;
    }
    // If backend returns UserResponse without token, auto-login with same credentials
    return await login({ username: payload.username, password: payload.password });
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("auth_user");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setProfile(null);
  }, []);

  // ── Listen for global 401 dispatch from api.js ────────────────────────────
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        profile,
        loading,
        loadingProfile,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
