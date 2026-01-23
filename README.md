# 🎰 OneMoreSpin

> *"Just one more spin..."* – Twoje wirtualne kasyno online

![.NET](https://img.shields.io/badge/.NET-8.0-purple?style=flat-square&logo=dotnet)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![SignalR](https://img.shields.io/badge/SignalR-Real--time-green?style=flat-square)

---

## 📖 O Projekcie

**OneMoreSpin** to platforma kasynowa online, oferująca gry hazardowe w wirtualnym środowisku. Projekt został stworzony jako pełnoprawna aplikacja do symulowania kasyna.

### ✨ Główne Funkcje

- 🎲 **Wieloosobowy Poker Texas Hold'em** – graj z innymi graczami w czasie rzeczywistym
- 🃏 **Blackjack** – klasyczna gra karciana w trybie solo i multiplayer
- 🎡 **Ruletka** – postaw na szczęście i zakręć kołem
- 🍒 **Automaty (Slots)** – kolorowe maszyny z różnymi liniami wygranych
- 💰 **System płatności** – wpłaty i wypłaty przez Stripe
- 🏆 **System misji** – codzienne i tygodniowe wyzwania z nagrodami
- 👑 **Program VIP** – bonusy +10-15% do wygranych dla lojalnych graczy
- 📊 **Historia gier** – pełna transparentność wszystkich rozgrywek
- 🌍 **Wielojęzyczność** – polski i angielski interfejs

---

## 🎮 Dostępne Gry

### 🃏 Poker Texas Hold'em
Klasyczna odmiana pokera dla 2-6 graczy. Graj przeciwko innym użytkownikom w czasie rzeczywistym dzięki technologii SignalR. System obejmuje pełną mechanikę: ante, blindy, licytacje, oraz wszystkie kombinacje kart od High Card po Royal Flush.

### 🎴 Blackjack
Zmierz się z krupierem! Dostępny w dwóch trybach:
- **Solo** – klasyczna rozgrywka 1v1 z krupierem AI
- **Multiplayer** – do 5 graczy przy jednym stole w czasie rzeczywistym

### 🎡 Ruletka
Europejska ruletka z pełnym zakresem zakładów: pojedyncze numery, kolory, parzyste/nieparzyste, dziesiątki i wiele więcej.

### 🍋 Automaty
Kolorowe sloty z 10 liniami wygrywającymi, 7 symbolami i progresywnym systemem wypłat. Od cytryn po szczęśliwe siódemki – każdy spin to nowa szansa!

---

## 🛠️ Stack Technologiczny

### Backend
| Technologia | Opis |
|-------------|------|
| **.NET 8** | Framework backendowy |
| **ASP.NET Core** | Web API i kontrolery MVC |
| **Entity Framework Core** | ORM i migracje bazy danych |
| **SignalR** | Komunikacja real-time dla gier multiplayer |
| **PostgreSQL** | Baza danych |
| **Stripe API** | System płatności |
| **JWT** | Autoryzacja i autentykacja |

### Frontend
| Technologia | Opis |
|-------------|------|
| **React 19** | Biblioteka UI |
| **TypeScript** | Typowany JavaScript |
| **Vite** | Build tool i dev server |
| **TailwindCSS** | Stylowanie komponentów |
| **Material-UI** | Komponenty UI |
| **React Router** | Nawigacja SPA |

---

## 📁 Struktura Projektu

```
OneMoreSpin/
├── OneMoreSpin.Web/           # API, kontrolery, middleware
├── OneMoreSpin.Services/      # Logika biznesowa gier
├── OneMoreSpin.Model/         # Modele danych i encje
├── OneMoreSpin.DAL/           # Warstwa dostępu do danych (EF Core)
├── OneMoreSpin.ViewModels/    # ViewModele i DTO
└── OneMoreSpin.Frontend/      # Aplikacja React (SPA)
    └── onemorespin-ui/
        └── src/
            ├── pages/         # Strony aplikacji
            ├── components/    # Komponenty wielokrotnego użytku
            ├── services/      # Serwisy API i SignalR
            └── hooks/         # Custom React hooks
```

---

## 🚀 Uruchomienie

### Wymagania
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15+

### Backend
```bash
cd OneMoreSpin.Web
dotnet restore
dotnet ef database update --project ../OneMoreSpin.DAL
dotnet run
```

### Frontend
```bash
cd OneMoreSpin.Frontend/onemorespin-ui
npm install
npm run dev
```

---

## ⚠️ Disclaimer

**OneMoreSpin** to projekt edukacyjny i demonstracyjny. Aplikacja wykorzystuje wirtualną walutę i **nie jest przeznaczona do prawdziwego hazardu**. Graj odpowiedzialnie!

---

## 📜 Licencja

Ten projekt jest udostępniony na licencji MIT. Zobacz plik [LICENSE](LICENSE) po szczegóły.

---

<div align="center">

**Made with ❤️ and lots of ☕**

*🎰 Just one more spin... 🎰*

</div>