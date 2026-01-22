import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "../api";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid password reset link.");
    }
  }, [token, email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;
    
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await api.auth.resetPassword({
        email,
        token,
        newPassword,
        confirmNewPassword
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reset password.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
        <h2 style={{ color: "lightgreen" }}>Password Reset Successful!</h2>
        <p>You will be redirected to the login page shortly...</p>
        <button className="submit-btn" onClick={() => navigate("/")} style={{ marginTop: "20px", width: "200px" }}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="auth-modal" style={{ position: "relative", width: "400px", padding: "2rem", background: "rgba(0,0,0,0.8)", borderRadius: "10px" }}>
        <h3 className="auth-modal-title">RESET PASSWORD</h3>
        
        {!token || !email ? (
          <div className="error">Invalid or missing reset token. Please request a new password reset link.</div>
        ) : (
          <form onSubmit={onSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="submit-btn" disabled={busy}>
              {busy ? "Resetting..." : "RESET PASSWORD"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
