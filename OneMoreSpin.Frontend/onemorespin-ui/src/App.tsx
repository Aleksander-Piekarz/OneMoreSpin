import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage.tsx";
import RegisterPage from "./RegisterPage";
import HomePage from "./HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
