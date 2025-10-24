import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage.tsx";
import RegisterPage from "./RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
