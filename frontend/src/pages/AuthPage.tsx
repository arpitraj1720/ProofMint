import React, { useState, useRef, useCallback, useEffect } from "react";
import { Page } from "../types";
import { useAuth } from "../context/AuthContext";
import { ProofMintIcon } from "../components/ProofMintLogo";
import { GoogleIcon, XCircleIcon, LockIcon } from "../components/icons/Icons";

export interface AuthPageProps {
  initialMode?: "login" | "register";
  notice?: string;
  setPage: (p: Page) => void;
}

export function AuthPage({ initialMode = "login", notice, setPage }: AuthPageProps) {
  const { login, loginGoogle, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuthResponse = useCallback(
    async (credential: string) => {
      setError(null);
      setLoading(true);
      try {
        await loginGoogle(credential);
        setPage("dashboard");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Google authentication failed.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [loginGoogle, setPage]
  );

  // Initialize Google Identity Services (One-Tap / ID listener)
  useEffect(() => {
    const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientId =
      rawClientId && !rawClientId.includes("your_google_oauth_client_id_here")
        ? rawClientId.trim()
        : "407500780524-g42dtf7t9edf8n5p6b16so6eqos8hbvr.apps.googleusercontent.com";
    if (!clientId) return;

    const initGsi = () => {
      if (typeof window === "undefined" || !window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res: { credential?: string }) => {
            if (res.credential) {
              setError(null);
              setLoading(true);
              try {
                await loginGoogle({ idToken: res.credential });
                setPage("dashboard");
              } catch (err: unknown) {
                const msg =
                  err instanceof Error ? err.message : "Google authentication failed.";
                setError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
        });
      } catch (err) {
        console.warn("GSI init warning:", err);
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [loginGoogle, setPage]);

  // Click handler for "Continue with Google"
  const handleGoogleClick = () => {
    setError(null);
    const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientId =
      rawClientId && !rawClientId.includes("your_google_oauth_client_id_here")
        ? rawClientId.trim()
        : "407500780524-g42dtf7t9edf8n5p6b16so6eqos8hbvr.apps.googleusercontent.com";

    if (!clientId) {
      setError(
        "Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env with your Google OAuth Client ID."
      );
      return;
    }

    if (!window.google?.accounts) {
      setError(
        "Google Identity Services is still loading. Please check your network connection and try again."
      );
      return;
    }

    try {
      // 1. Primary: Use Google OAuth Token Client to open Google Account Picker popup directly
      if (window.google.accounts.oauth2?.initTokenClient) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setError(`Google Sign In: ${tokenResponse.error_description || tokenResponse.error}`);
              return;
            }
            if (tokenResponse.access_token) {
              setError(null);
              setLoading(true);
              try {
                await loginGoogle({ accessToken: tokenResponse.access_token });
                setPage("dashboard");
              } catch (err: unknown) {
                const msg =
                  err instanceof Error ? err.message : "Google authentication failed.";
                setError(msg);
              } finally {
                setLoading(false);
              }
            }
          },
          error_callback: (err) => {
            console.error("Google OAuth error:", err);
            setError("Google sign-in popup was closed or cancelled.");
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      }

      // 2. Fallback: Prompt via GSI ID
      if (window.google.accounts.id) {
        window.google.accounts.id.prompt();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to open Google account picker.";
      setError(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        if (!loginIdentifier.trim()) {
          throw new Error("Please enter your username or email address.");
        }
        await login(loginIdentifier.trim(), password);
      } else {
        if (!username.trim()) {
          throw new Error("Please enter your username.");
        }
        if (!email.trim()) {
          throw new Error("Please enter your email address.");
        }
        await register(username.trim(), email.trim(), password);
      }
      setPage("dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-16 px-6 flex items-center justify-center"
      style={{ backgroundColor: "#24305E" }}
    >
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Notice from Landing CTA */}
        {notice && (
          <div
            className="rounded-md p-4 mb-6 flex items-center gap-3 shadow-md"
            style={{ backgroundColor: "#374785", borderLeft: "4px solid #F8E9A1" }}
          >
            <LockIcon size={18} className="text-[#F8E9A1] shrink-0" />
            <span className="text-xs font-semibold text-white">
              {notice}
            </span>
          </div>
        )}

        {/* Main Card */}
        <div
          className="rounded-md p-8 shadow-2xl"
          style={{ backgroundColor: "#374785", border: "1px solid rgba(168,208,230,0.15)" }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mx-auto mb-3.5">
              <ProofMintIcon size={52} />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {mode === "login" ? "Sign In to ProofMint" : "Create Your Account"}
            </h1>
            <p className="text-xs mt-1" style={{ color: "rgba(168,208,230,0.6)" }}>
              {mode === "login"
                ? "Access your personal image proofs and dashboard"
                : "Register and manage immutable image proofs on-chain"}
            </p>
          </div>

          {/* Mode Switcher */}
          <div
            className="flex rounded-md p-1 mb-6"
            style={{ backgroundColor: "rgba(36,48,94,0.6)" }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer"
              style={{
                backgroundColor: mode === "login" ? "#F76C6C" : "transparent",
                color: mode === "login" ? "white" : "rgba(168,208,230,0.6)",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className="flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer"
              style={{
                backgroundColor: mode === "register" ? "#F76C6C" : "transparent",
                color: mode === "register" ? "white" : "rgba(168,208,230,0.6)",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="rounded-md p-3.5 mb-5 text-xs font-semibold flex items-center gap-2.5 animate-fade-in-up text-white shadow-md"
              style={{
                backgroundColor: "#F76C6C",
              }}
            >
              <XCircleIcon size={16} color="#FFFFFF" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-md font-bold text-xs sm:text-sm transition-all hover:bg-white/10 active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-3 border"
              style={{
                backgroundColor: "rgba(36,48,94,0.8)",
                borderColor: "rgba(168,208,230,0.25)",
                color: "#FFFFFF",
              }}
            >
              <GoogleIcon className="w-5 h-5 flex-shrink-0" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-5">
            <div className="flex-1 border-t" style={{ borderColor: "rgba(168,208,230,0.15)" }} />
            <span
              className="px-3 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "rgba(168,208,230,0.45)" }}
            >
              or continue with {mode === "login" ? "credentials" : "email"}
            </span>
            <div className="flex-1 border-t" style={{ borderColor: "rgba(168,208,230,0.15)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "login" ? (
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#A8D0E6" }}
                >
                  Username or Email Address
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. alice123 or you@example.com"
                  className="w-full px-4 py-3 rounded-md text-sm font-medium text-white focus:outline-none transition-colors"
                  style={{
                    backgroundColor: "rgba(36,48,94,0.7)",
                    border: "1px solid rgba(168,208,230,0.2)",
                  }}
                />
              </div>
            ) : (
              <>
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "#A8D0E6" }}
                  >
                    Your Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alice123"
                    className="w-full px-4 py-3 rounded-md text-sm font-medium text-white focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(36,48,94,0.7)",
                      border: "1px solid rgba(168,208,230,0.2)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: "#A8D0E6" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-md text-sm font-medium text-white focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(36,48,94,0.7)",
                      border: "1px solid rgba(168,208,230,0.2)",
                    }}
                  />
                </div>
              </>
            )}

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "#A8D0E6" }}
              >
                Password{" "}
                {mode === "register" && (
                  <span className="text-[10px] font-normal lowercase">(min 6 chars)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-md text-sm font-medium text-white focus:outline-none transition-colors pr-12"
                  style={{
                    backgroundColor: "rgba(36,48,94,0.7)",
                    border: "1px solid rgba(168,208,230,0.2)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                  style={{ color: "#A8D0E6" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-md font-bold text-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#F76C6C",
                color: "white",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "login" ? (
                "Sign In to Dashboard"
              ) : (
                "Create Account & Proceed"
              )}
            </button>
          </form>

          {/* Footer switcher */}
          <div className="mt-6 text-center text-xs" style={{ color: "rgba(168,208,230,0.6)" }}>
            {mode === "login" ? (
              <p>
                Don't have an account yet?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="font-bold underline cursor-pointer hover:opacity-100"
                  style={{ color: "#F8E9A1" }}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="font-bold underline cursor-pointer hover:opacity-100"
                  style={{ color: "#F8E9A1" }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
