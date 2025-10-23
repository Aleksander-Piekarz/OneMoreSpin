import React, { useState, useEffect, useRef } from "react";
import AuthModal, { type AuthMode } from "./AuthModal";

const MainPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [activeVideo, setActiveVideo] = useState(0);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const video4Ref = useRef<HTMLVideoElement>(null);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const goToRegister = () => {
    window.location.href = '/register';
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
        // Reset flags when we're not near the end
        if (video === vid1 && timeLeft > 2.0) {
          vid1Triggered = false;
        } else if (video === vid2 && timeLeft > 2.0) {
          vid2Triggered = false;
        } else if (video === vid3 && timeLeft > 2.0) {
          vid3Triggered = false;
        } else if (video === vid4 && timeLeft > 2.0) {
          vid4Triggered = false;
        }
      }
    };

    // Preload all videos
    vid1.load();
    vid2.load();
    vid3.load();
    vid4.load();

    vid1.addEventListener("timeupdate", handleTimeUpdate);
    vid2.addEventListener("timeupdate", handleTimeUpdate);
    vid3.addEventListener("timeupdate", handleTimeUpdate);
    vid4.addEventListener("timeupdate", handleTimeUpdate);
    
    // Start first video when it's ready
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
    <div className="main-page">
      <div className="video-background">
        <video
          ref={video1Ref}
          className={`background-video ${activeVideo === 0 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="res/background-video-1.mp4" type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          className={`background-video ${activeVideo === 1 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="res/background-video-2.mp4" type="video/mp4" />
        </video>
        <video
          ref={video3Ref}
          className={`background-video ${activeVideo === 2 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="res/background-video-3.mp4" type="video/mp4" />
        </video>
        <video
          ref={video4Ref}
          className={`background-video ${activeVideo === 3 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src="res/background-video-4.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
      </div>

      <header className="top-bar">
        <button
          className="top-login-btn"
          onClick={() => openAuth("login")}
        >
          LOG IN
        </button>
      </header>

      <main className="content">
        <h1 className="title">ONE MORE SPIN</h1>
        <p className="subtitle">BEST ONLINE CASINO</p>

        <button
          className="create-account-btn"
          onClick={goToRegister}
        >
          CREATE ACCOUNT
        </button>
        
      </main>
      {showAuth && (
        <AuthModal mode={authMode} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
};

export default MainPage;
