import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { extractErrorMessage } from "../../services/api";
import { toast } from "../../util/toast";
import "./AuthPage.css";

// ── Icons ───────────────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="auth-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="auth-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg className="auth-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState(() =>
    location.pathname === "/register" ? "register" : "login"
  );
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [role, setRole] = useState("ROLE_USER");
  const [touched, setTouched] = useState({ username: false, password: false, email: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const switchMode = (newMode) => {
    if (loading || successState) return;
    setMode(newMode);
    setErrorBanner(null);
    setForm({ username: "", password: "", email: "" });
    setRole("ROLE_USER");
    setTouched({ username: false, password: false, email: false });
    navigate(newMode === "register" ? "/register" : "/login", { replace: true, state: location.state });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorBanner(null);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Client-side inline validation helpers
  const usernameError =
    touched.username && form.username.trim().length > 0 && form.username.trim().length < 3
      ? "Username must be at least 3 characters"
      : null;

  const passwordError =
    touched.password && form.password.length > 0 && form.password.length < 6
      ? "Password must be at least 6 characters"
      : null;

  const emailError =
    mode === "register" && touched.email && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? "Please enter a valid email address"
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || successState) return;

    setTouched({ username: true, password: true, email: true });

    if (form.username.trim().length < 3) {
      setErrorBanner("Username must be at least 3 characters long.");
      return;
    }
    if (form.password.length < 6) {
      setErrorBanner("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorBanner(null);

    try {
      if (mode === "login") {
        await login({ username: form.username.trim(), password: form.password });
        setSuccessState(true);
        toast.success(`Welcome back, ${form.username.trim()}!`, { duration: 2500 });
      } else {
        await register({
          username: form.username.trim(),
          password: form.password,
          email: form.email.trim() || undefined,
          role: role,
        });
        setSuccessState(true);
        toast.success("Account created successfully! Welcome aboard.", { duration: 2500 });
      }

      const handleLoginSuccess = () => {
        // Redirect back to intended target, or fallback to home
        const targetPath = location.state?.from || "/";
        navigate(targetPath, { replace: true });
      };

      // Smooth 900ms delay for user to perceive the success indicator before redirect
      setTimeout(handleLoginSuccess, 900);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrorBanner(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 flex items-center justify-center p-4">
      <div className={`auth-card bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.12)] border border-slate-200/80 p-8 sm:p-10 max-w-md w-full relative transition-all${successState ? " auth-success-exit" : ""}`}>
        {/* Branding */}
        <Link to="/" className="auth-logo block text-center mb-1" aria-label="BISHAL-MART Home">
          <span className="auth-logo-text bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-black text-2xl tracking-wider text-center block mb-1">
            BISHAL-MART
          </span>
        </Link>
        <h1 className="auth-title text-xl sm:text-2xl font-bold text-slate-900 text-center mb-1">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="auth-subtitle text-slate-500 text-sm text-center mb-8">
          {mode === "login"
            ? "Enter your credentials to access your account."
            : "Join BISHAL-MART today and enjoy seamless shopping."}
        </p>

        {/* Error Banner */}
        {errorBanner && (
          <div className="auth-error-banner flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-3 mb-6" role="alert">
            <AlertCircleIcon />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Auth Form */}
        <form className="auth-form flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="auth-field">
            <label className="auth-label text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block" htmlFor="auth-username">
              Username
            </label>
            <div className="auth-input-wrapper relative flex items-center">
              <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                <UserIcon />
              </span>
              <input
                id="auth-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Enter your username"
                className={`auth-input w-full bg-slate-50/80 border ${
                  usernameError ? "border-rose-400 ring-1 ring-rose-400" : "border-slate-200"
                } text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all shadow-sm`}
                value={form.username}
                onChange={handleChange}
                onBlur={() => handleBlur("username")}
                disabled={loading || successState}
              />
            </div>
            {usernameError && (
              <span className="auth-helper-msg text-xs text-rose-500 mt-1 block">{usernameError}</span>
            )}
          </div>

          {/* Email (Register mode) */}
          {mode === "register" && (
            <div className="auth-field">
              <label className="auth-label text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block" htmlFor="auth-email">
                Email address <span className="auth-optional normal-case font-normal text-slate-400">(optional)</span>
              </label>
              <div className="auth-input-wrapper relative flex items-center">
                <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                  <MailIcon />
                </span>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`auth-input w-full bg-slate-50/80 border ${
                    emailError ? "border-rose-400 ring-1 ring-rose-400" : "border-slate-200"
                  } text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all shadow-sm`}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  disabled={loading || successState}
                />
              </div>
              {emailError && (
                <span className="auth-helper-msg text-xs text-rose-500 mt-1 block">{emailError}</span>
              )}
            </div>
          )}

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block" htmlFor="auth-password">
              Password
            </label>
            <div className="auth-input-wrapper relative flex items-center">
              <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                <LockIcon />
              </span>
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                placeholder="••••••••"
                className={`auth-input w-full bg-slate-50/80 border ${
                  passwordError ? "border-rose-400 ring-1 ring-rose-400" : "border-slate-200"
                } text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all shadow-sm`}
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                disabled={loading || successState}
              />
              <button
                type="button"
                className="auth-eye-btn absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-lg transition"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordError && (
              <span className="auth-helper-msg text-xs text-rose-500 mt-1 block">{passwordError}</span>
            )}
          </div>

          {/* Role Selection (Register mode) */}
          {mode === "register" && (
            <div className="auth-field">
              <label className="auth-label text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                Register As
              </label>
              <div className="auth-role-group grid grid-cols-2 gap-3 mt-1.5">
                {/* Customer Option */}
                <button
                  type="button"
                  onClick={() => setRole("ROLE_USER")}
                  className={`auth-role-btn relative flex flex-col items-center justify-center py-3.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ease-out active:scale-95 gap-1.5 border ${
                    role === "ROLE_USER"
                      ? "active bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent ring-2 ring-indigo-600 ring-offset-2 scale-[1.02]"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-slate-100"
                  }`}
                >
                  {role === "ROLE_USER" && (
                    <span className="auth-role-badge absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-white text-indigo-600 shadow-sm">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                  <span className="text-xl">🛍️</span>
                  <span className="font-bold tracking-tight">Customer (Buyer)</span>
                </button>

                {/* Admin Option */}
                <button
                  type="button"
                  onClick={() => setRole("ROLE_ADMIN")}
                  className={`auth-role-btn relative flex flex-col items-center justify-center py-3.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ease-out active:scale-95 gap-1.5 border ${
                    role === "ROLE_ADMIN"
                      ? "active bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent ring-2 ring-indigo-600 ring-offset-2 scale-[1.02]"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-slate-100"
                  }`}
                >
                  {role === "ROLE_ADMIN" && (
                    <span className="auth-role-badge absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-white text-indigo-600 shadow-sm">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                  <span className="text-xl">⚡</span>
                  <span className="font-bold tracking-tight">Admin / Seller</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary CTA Button */}
          <button
            type="submit"
            className={`auth-submit-btn w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2${loading ? " loading" : ""}${successState ? " success" : ""}`}
            disabled={loading || successState}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                <span>
                  {mode === "login"
                    ? "Signing in…"
                    : "Creating your account…"}
                </span>
              </>
            ) : successState ? (
              <>
                <span className="auth-check-icon">✓</span>
                <span>
                  {mode === "login" ? "Welcome back!" : "Account created!"}
                </span>
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Bottom Subtext Navigation */}
        <p className="auth-footer-text text-slate-600 text-xs text-center mt-6 block">
          {mode === "login" ? (
            <>
              New to Bishal-Mart?{" "}
              <button
                type="button"
                className="auth-link-btn text-indigo-600 hover:text-indigo-700 font-bold ml-1 cursor-pointer underline-offset-4 hover:underline bg-transparent border-none p-0 inline"
                onClick={() => switchMode("register")}
              >
                Create one now
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link-btn text-indigo-600 hover:text-indigo-700 font-bold ml-1 cursor-pointer underline-offset-4 hover:underline bg-transparent border-none p-0 inline"
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
