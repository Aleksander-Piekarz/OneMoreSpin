import React, { useState, useEffect } from "react";
import MainPage from "./components/MainPage";
import RegisterPage from "./components/RegisterPage";

type Page = "home" | "register";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/register") {
      setCurrentPage("register");
    } else {
      setCurrentPage("home");
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/register") {
        setCurrentPage("register");
      } else {
        setCurrentPage("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update history when page changes
  useEffect(() => {
    if (currentPage === "register" && window.location.pathname !== "/register") {
      window.history.pushState({}, "", "/register");
    } else if (currentPage === "home" && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  }, [currentPage]);

  if (currentPage === "register") {
    return <RegisterPage />;
  }

  return <MainPage />;
};

export default App;
