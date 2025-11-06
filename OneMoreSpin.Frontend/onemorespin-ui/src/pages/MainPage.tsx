import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal, { type AuthMode } from "../components/AuthModal";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [activeVideo, setActiveVideo] = useState(0);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const video4Ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const goToRegister = () => {
    navigate("/register");
  };

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

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <video
          ref={video1Ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            activeVideo === 0 ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "brightness(0.5)" }}
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
          style={{ filter: "brightness(0.5)" }}
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
          style={{ filter: "brightness(0.5)" }}
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
          style={{ filter: "brightness(0.5)" }}
          muted
          playsInline
          preload="auto"
        >
          <source src="/res/background-video-4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <header className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="container flex items-center justify-between mx-auto">
          <button
            onClick={() => openAuth("login")}
            className="px-10 py-2 text-lg font-semibold text-white transition-all border-2 border-white rounded-full hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            LOG IN
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <h1
            className="text-5xl font-black text-white font-shoulders sm:text-7xl md:text-8xl lg:text-9xl animate-neon-pulse"
            style={{
              textShadow: `
                0 0 10px rgba(255, 255, 255, 0.8),
                0 0 20px rgba(255, 255, 255, 0.6),
                0 0 30px rgba(255, 255, 255, 0.4)
              `,
            }}
          >
            ONE MORE SPIN
          </h1>
          
          <p
            className="text-xl font-bold text-white sm:text-2xl md:text-3xl"
            style={{
              textShadow: `
                0 0 10px rgba(255, 255, 255, 0.7),
                0 0 20px rgba(255, 255, 255, 0.5)
              `,
            }}
          >
            BEST ONLINE CASINO
          </p>

          <button
            onClick={goToRegister}
            className="px-8 py-3 mt-8 text-lg font-bold text-black transition-all bg-white rounded-full hover:scale-105 hover:bg-gray-100 active:scale-95 md:px-12 md:py-4 md:text-2xl"
          >
            CREATE ACCOUNT
          </button>
        </div>
      </main>

      {showAuth && (
        <AuthModal mode={authMode} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
};

export default MainPage;
