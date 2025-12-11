import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export type AuthMode = "login" | "register" | "forgot-password";

type Props = {
  mode?: AuthMode;
  onClose: () => void;
};

const AuthModal: React.FC<Props> = ({ mode = "login", onClose }) => {
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem("jwt", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      onClose();
      navigate("/home");
    } catch (err: unknown) {
      const raw = (err instanceof Error) ? err.message : "Login failed";
      let msg = raw;
      if (/Invalid credentials/i.test(raw)) {
        msg = "Nieprawidłowy e-mail lub hasło";
      } else if (/confirm your e-mail|Please confirm/i.test(raw)) {
        msg = "Potwierdź adres e-mail przed zalogowaniem";
      } else if (/not found|user not found/i.test(raw)) {
        msg = "Użytkownik nie istnieje";
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const onSubmitForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setBusy(true);
    try {
      const res = await api.auth.forgotPassword({ email });
      setSuccessMessage(res.message || "Jeśli konto istnieje, link został wysłany.");
    } catch (err: unknown) {
      setError((err instanceof Error) ? err.message : "Wystąpił błąd.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>

        {currentMode === "login" ? (
          <>
            <h3 className="auth-modal-title">LOG IN</h3>
            <form onSubmit={onSubmitLogin} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>

              <div style={{ textAlign: "right", marginBottom: "10px" }}>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setCurrentMode("forgot-password")}
                  style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline" }}
                >
                  Forgot Password?
                </button>
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="submit-btn" disabled={busy}>
                {busy ? "Logging in..." : "LOG IN"}
              </button>
            </form>
          </>
        ) : currentMode === "forgot-password" ? (
          <>
            <h3 className="auth-modal-title">RESET PASSWORD</h3>
            <form onSubmit={onSubmitForgotPassword} className="auth-form" noValidate>
              <p style={{ color: "#ccc", marginBottom: "1rem" }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="form-group">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && <div className="error">{error}</div>}
              {successMessage && <div className="success" style={{ color: "lightgreen", marginBottom: "10px" }}>{successMessage}</div>}

              <button type="submit" className="submit-btn" disabled={busy}>
                {busy ? "Sending..." : "SEND RESET LINK"}
              </button>

              <button
                type="button"
                className="text-btn"
                onClick={() => setCurrentMode("login")}
                style={{ marginTop: "10px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline", width: "100%" }}
              >
                Back to Login
              </button>
            </form>
          </>
        ) : (
          <>
            <h3 className="auth-modal-title">REGISTER</h3>
            <p className="auth-modal-info">Please use the Create Account form.</p>
            <a className="create-account-btn" href="/register">CREATE ACCOUNT</a>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
