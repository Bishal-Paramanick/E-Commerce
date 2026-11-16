import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { extractErrorMessage } from "../../services/api";
import { toast } from "../../util/toast";
import "./AuthPage.css";

// ── Constants ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_USERNAME_LEN = 3;
const MIN_PASSWORD_LEN = 6;
const REDIRECT_DELAY_MS = 900;

// NOTE: the backend MUST ignore `role` on public registration (always ROLE_USER),
// otherwise anyone can register as an admin. Seller/admin access should come from
// an invite or approval flow. Remove ROLE_ADMIN from this list once that exists.
const ROLE_OPTIONS = [
  { value: "ROLE_USER", emoji: "🛍️", label: "Customer (Buyer)" },
  { value: "ROLE_ADMIN", emoji: "⚡", label: "Admin / Seller" },
];

const EMPTY_FORM = { username: "", password: "", email: "" };
const EMPTY_TOUCHED = { username: false, password: false, email: false };

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
  const { login, register, isAuthenticated } = useAuth();

  // Derived from the URL so header links to /login or /register switch the form
  const mode = location.pathname === "/register" ? "register" : "login";
  const isRegister = mode === "register";
  const redirectTarget = location.state?.from || "/";

  const [form, setForm] = useState(EMPTY_FORM);
  const [role, setRole] = useState("ROLE_USER");
  const [touched, setTouched] = useState(EMPTY_TOUCHED);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const redirectTimerRef = useRef(null);
  const submittedRef = useRef(false); // lets the success animation finish before redirecting

  // Clear pending redirect on unmount
  useEffect(() => {
    return () => clearTimeout(redirectTimerRef.current);
  }, []);

  // Already signed in (e.g. visited /login directly): skip the form
  useEffect(() => {
    if (isAuthenticated && !submittedRef.current) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget]);

  // Reset the form whenever the mode changes
  useEffect(() => {
    setErrorBanner(null);
    setForm(EMPTY_FORM);
    setRole("ROLE_USER");
    setTouched(EMPTY_TOUCHED);
  }, [mode]);

  const switchMode = (newMode) => {
    if (loading || successState) return;
    navigate(newMode === "register" ? "/register" : "/login", {
      replace: true,
      state: location.state,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorBanner(null);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Inline validation (length rules only apply when registering, so existing
  // users with older credentials can still sign in; the server judges logins)
  const trimmedUsername = form.username.trim();
  const trimmedEmail = form.email.trim();

  const usernameError =
    isRegister && touched.username && trimmedUsername.length > 0 && trimmedUsername.length < MIN_USERNAME_LEN
      ? `Username must be at least ${MIN_USERNAME_LEN} characters`
      : null;

  const passwordError =
    isRegister && touched.password && form.password.length > 0 && form.password.length < MIN_PASSWORD_LEN
      ? `Password must be at least ${MIN_PASSWORD_LEN} characters`
      : null;

  const emailError =
    isRegister && touched.email && trimmedEmail && !EMAIL_RE.test(trimmedEmail)
      ? "Please enter a valid email address"
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || successState) return;

    setTouched({ username: true, password: true, email: true });

    if (!trimmedUsername || !form.password) {
      setErrorBanner("Please enter your username and password.");
      return;
    }

    if (isRegister) {
      if (trimmedUsername.length < MIN_USERNAME_LEN) {
        setErrorBanner(`Username must be at least ${MIN_USERNAME_LEN} characters long.`);
        return;
      }
      if (form.password.length < MIN_PASSWORD_LEN) {
        setErrorBanner(`Password must be at least ${MIN_PASSWORD_LEN} characters long.`);
        return;
      }
      if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
        setErrorBanner("Please enter a valid email address.");
        return;
      }
    }

    setLoading(true);
    setErrorBanner(null);
    submittedRef.current = true;

    try {
      if (isRegister) {
        await register({
          username: trimmedUsername,
          password: form.password,
          email: trimmedEmail || undefined,
          role,
        });
        toast.success("Account created successfully! Welcome aboard.", { duration: 2500 });
      } else {
        await login({ username: trimmedUsername, password: form.password });
        toast.success(`Welcome back, ${trimmedUsername}!`, { duration: 2500 });
      }

      setSuccessState(true);
      setLoading(false);

      // Short delay so the user sees the success indicator before redirect
      redirectTimerRef.current = setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      submittedRef.current = false;
      const msg = extractErrorMessage(err) || "Something went wrong. Please try again.";
      setErrorBanner(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const busy = loading || successState;
  const inputBase =
    "auth-input w-full bg-slate-50/80 border text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all shadow-sm";
  const inputBorder = (hasError) =>
    hasError ? "border-rose-400 ring-1 ring-rose-400" : "border-slate-200";
  const labelClass =
    "auth-label text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block";
  const iconWrapClass =
    "absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center";

  return (
    <div className="auth-page min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 flex items-center justify-center p-4">
      <div
        className={`auth-card bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.12)] border border-slate-200/80 p-8 sm:p-10 max-w-md w-full relative transition-all${
          successState ? " auth-success-exit" : ""
        }`}
      >
        {/* Branding */}
        <Link to="/" className="auth-logo block text-center mb-1" aria-label="BISHAL-MART Home">
          <span className="auth-logo-text bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-black text-2xl tracking-wider text-center block mb-1">
            BISHAL-MART
          </span>
        </Link>
        <h1 className="auth-title text-xl sm:text-2xl font-bold text-slate-900 text-center mb-1">
          {isRegister ? "Create Account" : "Sign In"}
        </h1>
        <p className="auth-subtitle text-slate-500 text-sm text-center mb-8">
          {isRegister
            ? "Join BISHAL-MART today and enjoy seamless shopping."
            : "Enter your credentials to access your account."}
        </p>

        {/* Error Banner */}
        {errorBanner && (
          <div
            className="auth-error-banner flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl p-3 mb-6"
            role="alert"
          >
            <AlertCircleIcon />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Auth Form */}
        <form className="auth-form flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="auth-field">
            <label className={labelClass} htmlFor="auth-username">
              Username
            </label>
            <div className="auth-input-wrapper relative flex items-center">
              <span className={iconWrapClass}>
                <UserIcon />
              </span>
              <input
                id="auth-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Enter your username"
                className={`${inputBase} ${inputBorder(usernameError)}`}
                value={form.username}
                onChange={handleChange}
                onBlur={() => handleBlur("username")}
                disabled={busy}
                aria-invalid={Boolean(usernameError)}
              />
            </div>
            {usernameError && (
              <span className="auth-helper-msg text-xs text-rose-500 mt-1 block">{usernameError}</span>
            )}
          </div>

          {/* Email (Register mode) */}
          {isRegister && (
            <div className="auth-field">
              <label className={labelClass} htmlFor="auth-email">
                Email address{" "}
                <span className="auth-optional normal-case font-normal text-slate-400">(optional)</span>
              </label>
              <div className="auth-input-wrapper relative flex items-center">
                <span className={iconWrapClass}>
                  <MailIcon />
                </span>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`${inputBase} ${inputBorder(emailError)}`}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  disabled={busy}
                  aria-invalid={Boolean(emailError)}
                />
              </div>
              {emailError && (
                <span className="auth-helper-msg text-xs text-rose-500 mt-1 block">{emailError}</span>
              )}
            </div>
          )}

          {/* Password */}
          <div className="auth-field">
            <label className={labelClass} htmlFor="auth-password">
              Password
            </label>
            <div className="auth-input-wrapper relative flex items-center">
              <span className={iconWrapClass}>
                <LockIcon />
              </span>
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                placeholder="••••••••"
                className={`${inputBase} ${inputBorder(passwordError)}`}
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur("password")}
                disabled={busy}
                aria-invalid={Boolean(passwordError)}
              />
              <button
                type="button"
                className="auth-eye-btn absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1.5 rounded-lg transition"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordError && (
              <span className="auth-helper-msg text-xs text-rose-500 mt-1 block">{passwordError}</span>
            )}
          </div>

          {/* Role Selection (Register mode) */}
          {isRegister && (
            <div className="auth-field" role="radiogroup" aria-labelledby="auth-role-label">
              <span id="auth-role-label" className={labelClass}>
                Register As
              </span>
              <div className="auth-role-group grid grid-cols-2 gap-3 mt-1.5">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRole(opt.value)}
                      disabled={busy}
                      className={`auth-role-btn relative flex flex-col items-center justify-center py-3.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ease-out active:scale-95 gap-1.5 border ${
                        selected
                          ? "active bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border-transparent ring-2 ring-indigo-600 ring-offset-2 scale-[1.02]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-100"
                      }`}
                    >
                      {selected && (
                        <span className="auth-role-badge absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-white text-indigo-600 shadow-sm">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                      <span className="text-xl" aria-hidden="true">{opt.emoji}</span>
                      <span className="font-bold tracking-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary CTA Button */}
          <button
            type="submit"
            className={`auth-submit-btn w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2${
              loading ? " loading" : ""
            }${successState ? " success" : ""}`}
            disabled={busy}
          >
            {successState ? (
              <>
                <span className="auth-check-icon">✓</span>
                <span>{isRegister ? "Account created!" : "Welcome back!"}</span>
              </>
            ) : loading ? (
              <>
                <span className="btn-spinner" />
                <span>{isRegister ? "Creating your account…" : "Signing in…"}</span>
              </>
            ) : isRegister ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Bottom Subtext Navigation */}
        <p className="auth-footer-text text-slate-600 text-xs text-center mt-6 block">
          {isRegister ? "Already have an account? " : "New to Bishal-Mart? "}
          <button
            type="button"
            className="auth-link-btn text-indigo-600 hover:text-indigo-700 font-bold ml-1 cursor-pointer underline-offset-4 hover:underline bg-transparent border-none p-0 inline"
            onClick={() => switchMode(isRegister ? "login" : "register")}
          >
            {isRegister ? "Sign in" : "Create one now"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;