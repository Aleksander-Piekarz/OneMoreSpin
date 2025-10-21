import React, { useMemo, useState } from "react";

export type AuthMode = "register" | "login";

type Props = {
  mode: AuthMode;
  onClose: () => void;
};

const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const AuthModal: React.FC<Props> = ({ mode, onClose }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isRegister = mode === "register";
  const title = useMemo(() => (isRegister ? "Create Account" : "Log In"), [isRegister]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!emailRegex.test(email)) e.email = "Please enter a valid email";
    if (isRegister && username.trim().length < 3)
      e.username = "Username must be at least 3 characters";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (isRegister && password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (isRegister && !agreeTerms) e.agreeTerms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (isRegister) {
      console.log("Register data", { email, username, password, agreeTerms });
      alert("Registration submitted (frontend only)");
    } else {
      console.log("Login data", { email, password });
      alert("Login submitted (frontend only)");
    }
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h3>{title}</h3>
          <button className="btn icon" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="auth-modal-body">
          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`form-control ${errors.email ? "invalid" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              {errors.email && <small className="error">{errors.email}</small>}
            </div>

            {isRegister && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className={`form-control ${errors.username ? "invalid" : ""}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="JohnDoe1337"
                  required
                />
                {errors.username && (
                  <small className="error">{errors.username}</small>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`form-control ${errors.password ? "invalid" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Create a strong password" : "Your password"}
                required
              />
              {errors.password && (
                <small className="error">{errors.password}</small>
              )}
            </div>

            {isRegister && (
              <div className="form-group">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  className={`form-control ${errors.confirmPassword ? "invalid" : ""}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                />
                {errors.confirmPassword && (
                  <small className="error">{errors.confirmPassword}</small>
                )}
              </div>
            )}

            {isRegister && (
              <div className="form-group horizontal">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agree">I agree to the Terms and Privacy Policy</label>
              </div>
            )}

            {isRegister && errors.agreeTerms && (
              <small className="error">{errors.agreeTerms}</small>
            )}

            <div className="auth-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isRegister ? "Create account" : "Log in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
