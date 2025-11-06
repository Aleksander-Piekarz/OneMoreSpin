import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(0);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const video4Ref = useRef<HTMLVideoElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    confirmEmail: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    confirmAge: false,
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const vid1 = video1Ref.current;
    const vid2 = video2Ref.current;
    const vid3 = video3Ref.current;
    const vid4 = video4Ref.current;

    if (!vid1 || !vid2 || !vid3 || !vid4) return;

    let vid1Triggered = false;
    let vid2Triggered = false;
    let vid3Triggered = false;
    let vid4Triggered = false;

    const handleTimeUpdate = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const timeLeft = video.duration - video.currentTime;

      if (timeLeft <= 1.0) {
        if (video === vid1 && !vid1Triggered) {
          vid1Triggered = true;
          vid2.currentTime = 0;
          vid2.play();
          setActiveVideo(1);
        } else if (video === vid2 && !vid2Triggered) {
          vid2Triggered = true;
          vid3.currentTime = 0;
          vid3.play();
          setActiveVideo(2);
        } else if (video === vid3 && !vid3Triggered) {
          vid3Triggered = true;
          vid4.currentTime = 0;
          vid4.play();
          setActiveVideo(3);
        } else if (video === vid4 && !vid4Triggered) {
          vid4Triggered = true;
          vid1.currentTime = 0;
          vid1.play();
          setActiveVideo(0);
        }
      } else {
        if (video === vid1 && timeLeft > 2.0) vid1Triggered = false;
        else if (video === vid2 && timeLeft > 2.0) vid2Triggered = false;
        else if (video === vid3 && timeLeft > 2.0) vid3Triggered = false;
        else if (video === vid4 && timeLeft > 2.0) vid4Triggered = false;
      }
    };

    vid1.load();
    vid2.load();
    vid3.load();
    vid4.load();

    vid1.addEventListener("timeupdate", handleTimeUpdate);
    vid2.addEventListener("timeupdate", handleTimeUpdate);
    vid3.addEventListener("timeupdate", handleTimeUpdate);
    vid4.addEventListener("timeupdate", handleTimeUpdate);

    const handleCanPlay = () => {
      vid1.play();
      vid1.removeEventListener("canplay", handleCanPlay);
    };
    vid1.addEventListener("canplay", handleCanPlay);

    return () => {
      vid1.removeEventListener("timeupdate", handleTimeUpdate);
      vid2.removeEventListener("timeupdate", handleTimeUpdate);
      vid3.removeEventListener("timeupdate", handleTimeUpdate);
      vid4.removeEventListener("timeupdate", handleTimeUpdate);
      vid1.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = "Confirm email is required";
    } else if (formData.confirmEmail !== formData.email) {
      newErrors.confirmEmail = "Emails do not match";
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.confirmAge) {
      newErrors.confirmAge = "You must confirm you are at least 18 years old";
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms & Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setBusy(true);
    try {
      await api.auth.register({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setErrors({ general: message });
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-600 to-indigo-700">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-2xl rounded-2xl">
          <div className="mb-4 text-6xl">✅</div>
          <h2 className="mb-4 text-3xl font-black text-gray-900 font-shoulders">
            Check Your Email!
          </h2>
          <p className="mb-6 text-gray-600">
            We've sent a confirmation link to <strong>{formData.email}</strong>. Please
            check your inbox and click the link to verify your account.
          </p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-black px-8 py-3 font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <video
          ref={video1Ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            activeVideo === 0 ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "brightness(0.4)" }}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-1.mp4" type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            activeVideo === 1 ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "brightness(0.4)" }}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-2.mp4" type="video/mp4" />
        </video>
        <video
          ref={video3Ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            activeVideo === 2 ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "brightness(0.4)" }}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-3.mp4" type="video/mp4" />
        </video>
        <video
          ref={video4Ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            activeVideo === 3 ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "brightness(0.4)" }}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <header className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 text-sm font-semibold text-white transition-all border-2 border-white rounded-full hover:bg-white/10 hover:scale-105"
        >
          ← Back
        </button>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl">
          <div className="p-6 border-b border-gray-100 md:p-8">
            <h1 className="text-3xl font-black text-gray-900 font-shoulders md:text-4xl">
              CREATE ACCOUNT
            </h1>
            <p className="mt-2 text-gray-600">Join the best online casino today</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 md:p-8">
            {errors.general && (
              <div className="p-4 text-sm text-red-600 rounded-lg bg-red-50">
                {errors.general}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-gray-200 focus:border-gray-900 focus:ring-gray-900/10"
                  }`}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="surname" className="block text-sm font-semibold text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className={`w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                    errors.surname
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-gray-200 focus:border-gray-900 focus:ring-gray-900/10"
                  }`}
                />
                {errors.surname && <p className="text-sm text-red-600">{errors.surname}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-gray-200 focus:border-gray-900 focus:ring-gray-900/10"
                }`}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmEmail" className="block text-sm font-semibold text-gray-700">
                Confirm Email *
              </label>
              <input
                type="email"
                id="confirmEmail"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                  errors.confirmEmail
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-gray-200 focus:border-gray-900 focus:ring-gray-900/10"
                }`}
              />
              {errors.confirmEmail && (
                <p className="text-sm text-red-600">{errors.confirmEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                  errors.dateOfBirth
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-gray-200 focus:border-gray-900 focus:ring-gray-900/10"
                }`}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-gray-200 focus:border-gray-900 focus:ring-gray-900/10"
                  }`}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-gray-200 focus:border-gray-900 focus:ring-gray-900/10"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="confirmAge"
                  checked={formData.confirmAge}
                  onChange={handleChange}
                  className={`mt-1 h-5 w-5 rounded border-2 ${
                    errors.confirmAge ? "border-red-300" : "border-gray-300"
                  } text-black focus:ring-2 focus:ring-gray-900/10 focus:outline-none`}
                />
                <span className="text-sm text-gray-700">
                  I confirm that I am at least 18 years old
                </span>
              </label>
              {errors.confirmAge && (
                <p className="text-sm text-red-600">{errors.confirmAge}</p>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className={`mt-1 h-5 w-5 rounded border-2 ${
                    errors.acceptTerms ? "border-red-300" : "border-gray-300"
                  } text-black focus:ring-2 focus:ring-gray-900/10 focus:outline-none`}
                />
                <span className="text-sm text-gray-700">
                  I accept the <span className="font-semibold">Terms</span> and
                  {" "}
                  <span className="font-semibold">Privacy Policy</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-black py-3 text-lg font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              {busy ? "Creating Account..." : "CREATE ACCOUNT"}
            </button>

            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="font-semibold text-black hover:underline"
              >
                Log in
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
