import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import SlotsPage from "./pages/SlotsPage";
import RoulettePage from "./pages/RoulettePage";
import BlackjackPage from "./pages/BlackjackPage";
import { PokerLobby } from "./pages/PokerLobby";
import { PokerPage } from "./pages/PokerPage";
import SinglePokerPage  from "./pages/SinglePokerPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/slots" element={<SlotsPage />} />
        <Route path="/roulette" element={<RoulettePage />} />
        <Route path="/blackjack" element={<BlackjackPage />} />
        <Route path="/poker" element={<PokerLobby />} />
        <Route path="/poker/:tableId" element={<PokerPage />} />
        <Route path="/single-poker/" element={<SinglePokerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

