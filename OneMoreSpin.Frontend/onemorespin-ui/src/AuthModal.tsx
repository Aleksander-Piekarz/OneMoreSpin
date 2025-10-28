import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

export type AuthMode = "login" | "register";

type Props = {
  mode?: AuthMode;
  onClose: () => void;
};

const AuthModal: React.FC<Props> = ({ mode = "login", onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>

        {mode === "login" ? (
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

              {error && <div className="error">{error}</div>}

              <button type="submit" className="submit-btn" disabled={busy}>
                {busy ? "Logging in..." : "LOG IN"}
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
