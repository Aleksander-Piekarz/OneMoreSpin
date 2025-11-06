import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal, { type AuthMode } from "./AuthModal";
import video1 from "../assets/vids/background-video-1.mp4";
import video2 from "../assets/vids/background-video-2.mp4";
import video3 from "../assets/vids/background-video-3.mp4";
import video4 from "../assets/vids/background-video-4.mp4";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [activeVideo, setActiveVideo] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [flash, setFlash] = useState<string>("");

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const video4Ref = useRef<HTMLVideoElement>(null);

  const videoSequence = useRef<number[]>([]);
  const currentSequenceIndex = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  useEffect(() => {
    const msg = localStorage.getItem("flash");
    if (msg) {
      setFlash(msg);
      localStorage.removeItem("flash");
      const t = setTimeout(() => setFlash(""), 4000);
      return () => clearTimeout(t);
    }
  }, []);

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

    const videos = [vid1, vid2, vid3, vid4];

    const shuffleArray = (array: number[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    videoSequence.current = shuffleArray([0, 1, 2, 3]);
    currentSequenceIndex.current = 0;

    const videoTriggerFlags = [false, false, false, false];

    const handleTimeUpdate = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      const videoIndex = videos.indexOf(video);
      const timeLeft = video.duration - video.currentTime;

      if (timeLeft <= 1.0) {
        if (!videoTriggerFlags[videoIndex]) {
          videoTriggerFlags[videoIndex] = true;
          
          currentSequenceIndex.current = (currentSequenceIndex.current + 1) % videoSequence.current.length;
          const nextVideoIndex = videoSequence.current[currentSequenceIndex.current];
          const nextVideo = videos[nextVideoIndex];

          nextVideo.currentTime = 0;
          nextVideo.play();
          setActiveVideo(nextVideoIndex);
        }
      } else {
        if (timeLeft > 2.0) {
          videoTriggerFlags[videoIndex] = false;
        }
      }
    };

    vid1.load(); vid2.load(); vid3.load(); vid4.load();

    vid1.addEventListener("timeupdate", handleTimeUpdate);
    vid2.addEventListener("timeupdate", handleTimeUpdate);
    vid3.addEventListener("timeupdate", handleTimeUpdate);
    vid4.addEventListener("timeupdate", handleTimeUpdate);

    const handleCanPlay = () => {
      const firstVideoIndex = videoSequence.current[0];
      videos[firstVideoIndex].play();
      setActiveVideo(firstVideoIndex);
      
      setTimeout(() => {
        setIsVideoReady(true);
      }, 100);
      
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
          <source src={video1} type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          className={`background-video ${activeVideo === 1 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src={video2} type="video/mp4" />
        </video>
        <video
          ref={video3Ref}
          className={`background-video ${activeVideo === 2 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src={video3} type="video/mp4" />
        </video>
        <video
          ref={video4Ref}
          className={`background-video ${activeVideo === 3 ? "active" : ""}`}
          muted
          playsInline
          preload="auto"
        >
          <source src={video4} type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
        <div className={`black-overlay ${isVideoReady ? "fade-out" : ""}`}></div>
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

      {flash && (
        <div className="toast-container">
          <div className="toast success">{flash}</div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
