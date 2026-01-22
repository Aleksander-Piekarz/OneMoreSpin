import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "../api";

export type AuthMode = "login" | "register" | "forgot-password";

type Props = {
  mode?: AuthMode;
  onClose: () => void;
};

const AuthModal: React.FC<Props> = ({ mode = "login", onClose }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
            <h3 className="auth-modal-title">{t('common.login').toUpperCase()}</h3>
            <form onSubmit={onSubmitLogin} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="login-email">{t('auth.email')}</label>
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
                <label htmlFor="login-password">{t('auth.password')}</label>
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
                  {t('auth.forgotPassword')}
                </button>
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="submit-btn" disabled={busy}>
                {busy ? t('common.loading') : t('common.login').toUpperCase()}
              </button>
            </form>
          </>
        ) : currentMode === "forgot-password" ? (
          <>
            <h3 className="auth-modal-title">{t('auth.resetPassword').toUpperCase()}</h3>
            <form onSubmit={onSubmitForgotPassword} className="auth-form" noValidate>
              <p style={{ color: "#ccc", marginBottom: "1rem" }}>
                Wpisz adres email i wyślemy Ci link do resetowania hasła.
              </p>
              <div className="form-group">
                <label htmlFor="forgot-email">{t('auth.email')}</label>
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
                {busy ? t('common.loading') : t('auth.resetPassword').toUpperCase()}
              </button>

              <button
                type="button"
                className="text-btn"
                onClick={() => setCurrentMode("login")}
                style={{ marginTop: "10px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline", width: "100%" }}
              >
                {t('common.back')}
              </button>
            </form>
          </>
        ) : (
          <>
            <h3 className="auth-modal-title">{t('common.register').toUpperCase()}</h3>
            <p className="auth-modal-info">Użyj formularza Rejestracji.</p>
            <a className="create-account-btn" href="/register">{t('common.register').toUpperCase()}</a>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
