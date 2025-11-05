import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [activeVideo, setActiveVideo] = useState(0);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const video4Ref = useRef<HTMLVideoElement>(null);

  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;

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

    vid1.load(); vid2.load(); vid3.load(); vid4.load();

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

  const validate = () => {
    const e: Record<string, string> = {};

    if (name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (surname.trim().length < 2) e.surname = "Surname must be at least 2 characters";

    if (!birthDate) e.birthDate = "Birth date is required";
    else {
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18) e.birthDate = "You must be at least 18 years old";
    }

    if (!emailRegex.test(email)) e.email = "Please enter a valid email";
    if (email !== confirmEmail) e.confirmEmail = "Emails do not match";

    if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";

    if (!agreeTerms) e.agreeTerms = "You must accept the terms of use";
    if (!agreeAge) e.agreeAge = "You must confirm you are 18 years old";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      await api.auth.register({
        email,
        password,
        name,
        surname,
        dateOfBirth: birthDate, // ISO zrobimy w api.ts
      });
      alert("Registration successful. Please log in.");
      navigate("/");
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="register-page">
      <div className="video-background">
        <video
          ref={video1Ref}
          className={`background-video ${activeVideo === 0 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-1.mp4" type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          className={`background-video ${activeVideo === 1 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-2.mp4" type="video/mp4" />
        </video>
        <video
          ref={video3Ref}
          className={`background-video ${activeVideo === 2 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-3.mp4" type="video/mp4" />
        </video>
        <video
          ref={video4Ref}
          className={`background-video ${activeVideo === 3 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-4.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
      </div>

      <button className="back-to-home-btn" onClick={handleBackToHome}>
        ← Back to Home
      </button>

      <div className="register-container">
        <div className="register-box">
          <div className="register-decorations">
            <div className="decoration-corner top-left"></div>
            <div className="decoration-corner top-right"></div>
            <div className="decoration-corner bottom-left"></div>
            <div className="decoration-corner bottom-right"></div>
          </div>

          <h2 className="register-title">CREATE ACCOUNT</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  className={`form-input ${errors.name ? "invalid" : ""}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John"
                  required
                />
                {errors.name && <small className="error">{errors.name}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input
                  id="surname"
                  type="text"
                  className={`form-input ${errors.surname ? "invalid" : ""}`}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Doe"
                  required
                />
                {errors.surname && <small className="error">{errors.surname}</small>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Birth Date</label>
              <input
                id="birthDate"
                type="date"
                className={`form-input ${errors.birthDate ? "invalid" : ""}`}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
              {errors.birthDate && <small className="error">{errors.birthDate}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "invalid" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              {errors.email && <small className="error">{errors.email}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmEmail">Repeat Email</label>
              <input
                id="confirmEmail"
                type="email"
                className={`form-input ${errors.confirmEmail ? "invalid" : ""}`}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              {errors.confirmEmail && <small className="error">{errors.confirmEmail}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? "invalid" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
              {errors.password && <small className="error">{errors.password}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Repeat Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? "invalid" : ""}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
              />
              {errors.confirmPassword && <small className="error">{errors.confirmPassword}</small>}
            </div>

            <div className="checkbox-group">
              <div className="checkbox-wrapper">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agreeTerms">I agree to the Terms of Use</label>
              </div>
              {errors.agreeTerms && <small className="error">{errors.agreeTerms}</small>}
            </div>

            <div className="checkbox-group">
              <div className="checkbox-wrapper">
                <input
                  id="agreeAge"
                  type="checkbox"
                  checked={agreeAge}
                  onChange={(e) => setAgreeAge(e.target.checked)}
                />
                <label htmlFor="agreeAge">I confirm I am 18 years old</label>
              </div>
              {errors.agreeAge && <small className="error">{errors.agreeAge}</small>}
            </div>

            <button type="submit" className="submit-btn">
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
