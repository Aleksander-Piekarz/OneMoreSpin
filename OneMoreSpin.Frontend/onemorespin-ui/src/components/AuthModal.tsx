import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>

        {mode === "login" ? (
          <>
            <div className="border-b border-gray-100 p-6">
              <h3 className="font-shoulders text-3xl font-black text-gray-900">
                LOG IN
              </h3>
            </div>

            <form onSubmit={onSubmitLogin} className="space-y-4 p-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
              >
                {busy ? "Logging in..." : "LOG IN"}
              </button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/register");
                  }}
                  className="font-semibold text-black hover:underline"
                >
                  Create Account
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="border-b border-gray-100 p-6">
              <h3 className="font-shoulders text-3xl font-black text-gray-900">
                REGISTER
              </h3>
            </div>

            <div className="p-6 text-center">
              <p className="mb-4 text-gray-600">
                Please use the Create Account form.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/register");
                }}
                className="rounded-lg bg-black px-8 py-3 font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
              >
                CREATE ACCOUNT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
