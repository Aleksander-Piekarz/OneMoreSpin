import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'pl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Tłumaczenia
const translations: Record<Language, any> = {
  pl: {
    common: {
      welcome: "Witamy",
      login: "Zaloguj się",
      register: "Zarejestruj się",
      logout: "Wyloguj",
      logOut: "Wyloguj się",
      home: "Strona główna",
      profile: "Profil",
      admin: "Panel admina",
      settings: "Ustawienia",
      language: "Język",
      balance: "Saldo",
      loading: "Status",
      error: "Błąd",
      success: "Sukces",
      cancel: "Anuluj",
      confirm: "Potwierdź",
      back: "Wstecz",
      play: "Graj",
      bet: "Zakład",
      spin: "Zakręć",
      deal: "Rozdaj",
      hit: "Dobierz",
      stand: "Pasuj",
      double: "Podwój",
      split: "Rozdziel",
      save: "Zapisz",
      close: "Zamknij",
      deposit: "Wpłata",
      withdraw: "Wypłata",
      history: "Historia",
      characters: "znaków",
      you: "Ty"
    },
    nav: {
      games: "Gry",
      slots: "Automaty",
      roulette: "Ruletka",
      blackjack: "Blackjack",
      poker: "Poker"
    },
    auth: {
      username: "Nazwa użytkownika",
      email: "Email",
      password: "Hasło",
      confirmPassword: "Potwierdź hasło",
      forgotPassword: "Zapomniałeś hasła?",
      resetPassword: "Resetuj hasło",
      noAccount: "Nie masz konta?",
      hasAccount: "Masz już konto?",
      loginSuccess: "Zalogowano pomyślnie",
      registerSuccess: "Rejestracja zakończona",
      name: "Imię",
      surname: "Nazwisko",
      signUp: "Zarejestruj się",
      enterEmail: "Wpisz email",
      enterPassword: "Wpisz hasło",
      confirmYourPassword: "Potwierdź hasło",
      invalidEmail: "Nieprawidłowy adres email",
      passwordMismatch: "Hasła się nie zgadzają",
      passwordTooShort: "Hasło musi mieć co najmniej 6 znaków",
      userExists: "Użytkownik o tym emailu już istnieje",
      invalidCredentials: "Nieprawidłowy email lub hasło",
      confirmEmail: "Potwierdź adres email przed zalogowaniem"
    },
    games: {
      blackjack: {
        title: "Blackjack",
        description: "Pobij krupiera i zdobądź 21!",
        selectMode: "Wybierz tryb gry",
        classicBlackjack: "Classic Blackjack",
        classicDescription: "Klasyczny blackjack. Graj sam przeciwko krupierowi i doskonał swoje umiejętności.",
        playSolo: "Graj Solo",
        multiplayer21: "Multiplayer 21",
        multiplayerDescription: "Prawdziwe emocje przy stole! Dołącz do innych graczy i pokonaj krupiera razem.",
        joinTable: "Dołącz do Stołu",
        singlePlayer: "Gra jednoosobowa",
        multiplayer: "Gra wieloosobowa",
        lobby: "Lobby",
        dealer: "Krupier",
        dealerScore: "Wynik krupiera",
        dealerCards: "Karty Krupiera",
        yourScore: "Twój wynik",
        betAmount: "Kwota zakładu",
        winAmount: "Wygrana",
        dealCards: "ROZDAJ KARTY",
        dealing: "ROZDAWANIE...",
        hit: "DOBIERZ",
        stand: "PASUJ",
        double: "PODWÓJ",
        win: "WYGRANA!",
        blackjack: "BLACKJACK!",
        lose: "PRZEGRANA",
        push: "REMIS",
        waiting: "Oczekiwanie...",
        dealToStart: "Rozdaj karty, aby zagrać",
        currentBet: "Stawka: {{bet}} PLN",
        invalidBet: "Wpisz kwotę większą niż 0",
        insufficientBalance: "Niewystarczający balans",
        gameError: "Błąd podczas rozpoczynania gry",
        hitError: "Błąd podczas dobierania karty",
        standError: "Błąd podczas pasowania",
        doubleError: "Błąd podczas podwajania",
        showLeaderboard: "Pokaż ranking",
        hideLeaderboard: "Schowaj ranking",
        connecting: "Łączenie z kasynem...",
        enteringTable: "Wchodzenie do stołu...",
        tableLabel: "Stół",
        stageLabel: "Etap",
        leaveTable: "Wyjdź",
        yourTurn: "Twój ruch",
        historyTitle: "Historia gry",
        tableChat: "Czat stołu",
        startChat: "Rozpocznij rozmowę...",
        chatPlaceholder: "Napisz wiadomość...",
        placeBet: "Postaw",
        roundStartsIn: "Runda zaczyna się za",
        waitingForOthers: "Czekanie na innych graczy..."
      },
      roulettePage: {
        title: "Ruletka",
        placeBet: "Postaw zakład",
        selectNumber: "Wybierz numer",
        selectColor: "Wybierz kolor",
        red: "Czerwone",
        black: "Czarne",
        even: "Parzyste",
        odd: "Nieparzyste"
      },
      poker: {
        title: "Poker",
        description: "Zagraj w Texas Hold'em",
        selectMode: "Wybierz tryb gry",
        royalPoker: "Royal Poker",
        royalDescription: "Trening czyni mistrza. Graj przeciwko krupierowi i doskonał swoje umiejętności.",
        playSolo: "Graj Solo",
        texasHoldem: "Texas Hold'em",
        texasDescription: "Prawdziwe emocje przy stole! Dołącz do innych graczy i walcz o najwyższe stawki.",
        joinTable: "Dołącz do Stołu",
        singlePlayer: "Gra jednoosobowa",
        multiplayer: "Gra wieloosobowa",
        lobby: "Lobby",
        fold: "Pasuj",
        call: "Sprawdź",
        raise: "Podbij",
        check: "Czekaj",
        allIn: "All-in",
        yourCards: "Twoje karty",
        communityCards: "Karty wspólne",
        pot: "Pula",
        turn: "Twoja kolej",
        bet: "Zakład",
        waiting: "Oczekiwanie...",
        dealToStart: "Rozdaj karty, aby zagrać",
        dealCards: "ROZDAJ KARTY",
        dealing: "TASOWANIE...",
        nextRound: "NASTĘPNE ROZDANIE",
        selectCards: "Wybierz karty do wymiany",
        selectedCards: "Wybrano do wymiany: {{count}}",
        exchange: "WYMIEŃ KARTY",
        win: "WYGRANA!",
        lose: "PRZEGRANA",
        gameStartError: "Błąd startu",
        gameExchangeError: "Błąd wymiany",
        showLeaderboard: "Pokaż ranking",
        hideLeaderboard: "Schowaj ranking",
        connecting: "Łączenie z kasynem...",
        enteringTable: "Wchodzenie do stołu...",
        tableLabel: "Stół",
        stageLabel: "Etap",
        leaveTable: "Wyjdź",
        historyTitle: "Historia gry",
        tableChat: "Czat stołu",
        startChat: "Rozpocznij rozmowę...",
        chatPlaceholder: "Napisz wiadomość...",
        folded: "Pas",
        youFolded: "Spasowałeś",
        ready: "Gotowy",
        setReady: "Jestem gotowy",
        playersReady: "Gotowi gracze",
        startingIn: "Start za"
      },
      slots: {
        title: "Automaty",
        description: "Zagraj w automaty i wygraj!",
        spin: "ZAKRĘĆ",
        bet: "Zakład",
        invalidBet: "Wpisz kwotę większą niż 0",
        insufficientBalance: "Niewystarczający balans",
        gameError: "Błąd podczas gry",
        win: "WYGRANA!",
        showLeaderboard: "Pokaż ranking",
        hideLeaderboard: "Schowaj ranking"
      },
      roulette: {
        title: "Ruletka",
        description: "Postaw żetony i zakręć!",
        placeBet: "Postaw żeton",
        selectNumber: "Wybierz numer",
        selectColor: "Wybierz kolor",
        red: "Czerwone",
        black: "Czarne",
        even: "Parzyste",
        odd: "Nieparzyste",
        low: "Niskie",
        high: "Wysokie",
        bet: "Zakład",
        spin: "ZAKRĘĆ",
        gameError: "Błąd gry",
        win: "WYGRANA!",
        invalidBet: "Wpisz kwotę większą niż 0",
        insufficientBalance: "Niewystarczający balans",
        showLeaderboard: "Pokaż ranking",
        hideLeaderboard: "Schowaj ranking"
      }
    },
    profile: {
      title: "Twój profil",
      userInfo: "Informacje o użytkowniku",
      statistics: "Statystyki",
      gamesPlayed: "Rozegrane gry",
      totalWins: "Wygrane",
      totalLosses: "Przegrane",
      winRate: "Procent wygranych",
      missions: "Misje",
      dailyMissions: "Misje dzienne",
      dailyRewards: "Nagrody dzienne",
      streak: "Seria",
      days: "dni",
      claimReward: "Odbierz nagrodę",
      nextRewardIn: "Następna nagroda za",
      name: "Imię",
      surname: "Nazwisko",
      email: "Email",
      vipStatus: "Status VIP",
      isVip: "Tak, jestem VIP",
      notVip: "Nie jestem VIP",
      changePassword: "Zmień hasło",
      currentPassword: "Aktualne hasło",
      newPassword: "Nowe hasło",
      confirmNewPassword: "Potwierdź nowe hasło",
      security: "Bezpieczeństwo",
      changePasswordTitle: "Zmiana hasła",
      changePasswordButton: "ZMIEŃ HASŁO",
      deleteAccountButton: "USUŃ KONTO",
      deleteAccount: "Usuń konto",
      deleteAccountTitle: "Usuń konto",
      deleteAccountWarning: "⚠️ Ostrzeżenie!",
      deleteAccountText: "Ta operacja jest nieodwracalna. Wszystkie Twoje dane, historia gier i saldo zostaną permanentnie usunięte.",
      deleteAccountConfirm: "Czy na pewno chcesz usunąć swoje konto?",
      enterPasswordToConfirm: "Wpisz swoje hasło aby potwierdzić",
      allFieldsRequired: "Wszystkie pola są wymagane",
      passwordMinLength: "Nowe hasło musi mieć co najmniej 6 znaków",
      passwordNotMatching: "Nowe hasła nie są zgodne",
      passwordChangedSuccess: "Hasło zostało zmienione pomyślnie",
      passwordChanged: "Hasło zostało zmienione",
      passwordChangeError: "Nie udało się zmienić hasła",
      invalidPassword: "Nieprawidłowe hasło",
      deleteAccountError: "Nie udało się usunąć konta",
      deleteAccountSuccess: "Konto zostało pomyślnie usunięte",
      keepAccount: "Nie, zachowaj konto",
      confirmDeleteAccount: "Tak, usuń konto",
      cancel: "Anuluj",
      transactions: "Transakcje",
      gameHistory: "Historia gier",
      noTransactions: "Brak transakcji",
      noGameHistory: "Brak historii gier",
      loadMore: "Wczytaj więcej",
      depositFunds: "Wpłać środki",
      withdrawFunds: "Wypłać środki",
      enterAmount: "Wpisz kwotę",
      minimumAmount: "Minimalnie",
      maximumAmount: "Maksymalnie",
      processingPayment: "Przetwarzanie płatności...",
      balance: "Saldo",
      type: "Typ",
      outcome: "Wynik",
      winAmount: "Wygrana",
      date: "Data",
      win: "Wygrana",
      lose: "Przegrana"
    },
    missions: {
      title: "Misje",
      daily: "Dzienne",
      completed: "Ukończone",
      inProgress: "W trakcie",
      reward: "Nagroda",
      progress: "Postęp",
      claim: "Odbierz",
      claimed: "Odebrane",
      complete: "Ukończ",
      completionReward: "Nagroda za ukończenie"
    },
    admin: {
      title: "Panel Administratora",
      users: "Użytkownicy",
      userManagement: "Zarządzanie użytkownikami",
      email: "Email",
      name: "Imię",
      surname: "Nazwisko",
      balance: "Saldo",
      isVip: "VIP",
      isActive: "Aktywny",
      actions: "Akcje",
      edit: "Edytuj",
      delete: "Usuń",
      ban: "Zablokuj",
      unban: "Odblokuj",
      makeVip: "Uczyń VIP",
      removeVip: "Usuń VIP",
      noUsers: "Brak użytkowników",
      firstName: "Imię",
      lastName: "Nazwisko",
      active: "Aktywni",
      vip: "VIP",
      searchPlaceholder: "🔍 Szukaj użytkownika...",
      id: "ID",
      status: "Status",
      noPermissions: "Brak uprawnień administratora",
      serverError: "Błąd serwera",
      loading: "⏳ Ładowanie...",
      error: "❌ Błąd",
      confirmDelete: "Czy na pewno chcesz usunąć tego użytkownika?",
      userDeleted: "Użytkownik usunięty",
      deleteError: "Błąd podczas usuwania",
      updateBalance: "Zmień balans",
      enterBalance: "Podaj nowy balans:",
      balanceUpdated: "Balans zaktualizowany",
      updateError: "Błąd podczas aktualizacji balansu",
      previous: "← Poprzednia",
      next: "Następna →",
      page: "Strona",
      of: "/"
    },
    lobby: {
      title: "Lobby",
      createTable: "Utwórz stół",
      joinTable: "Dołącz do stołu",
      availableTables: "Dostępne stoły",
      tableName: "Nazwa stołu",
      minBet: "Minimalny zakład",
      maxBet: "Maksymalny zakład",
      maxPlayers: "Maks. graczy",
      currentPlayers: "Aktualnie graczy",
      waiting: "Oczekiwanie...",
      players: "Gracze",
      status: "Status",
      startGame: "Zacznij grę",
      joinGame: "Dołącz do gry",
      full: "Pełne",
      inProgress: "Trwa gra",
      selectTable: "Wybierz stół i zacznij grać",
      playNow: "Zagraj teraz",
      minBuyIn: "Min. wejście",
      loadingTables: "Ładowanie stołów..."
    },
    validation: {
      required: "To pole jest wymagane",
      invalidEmail: "Nieprawidłowy adres email",
      passwordTooShort: "Hasło musi mieć co najmniej 6 znaków",
      passwordMismatch: "Hasła się nie zgadzają",
      amountInvalid: "Nieprawidłowa kwota",
      amountTooSmall: "Kwota za mała",
      insufficientBalance: "Niewystarczające saldo"
    },
    help: {
      help: "Pomoc",
      howToPlay: "Jak grać?",
      rules: "Zasady gry",
      actions: "Dostępne akcje",
      tips: "Porady",
      // Poker
      pokerTitle: "Texas Hold'em Poker",
      pokerDesc: "Gra karciana, w której celem jest zdobycie najlepszego układu 5 kart z 7 dostępnych (2 własne + 5 wspólnych).",
      goalOfGame: "Cel gry",
      winPot: "Wygraj pulę mając najlepszy układ kart lub zmuszając wszystkich przeciwników do spasowania.",
      ante: "Ante",
      anteDesc: "Na początku każdego rozdania każdy gracz wpłaca ante (100$) do puli startowej.",
      gameStages: "Etapy gry",
      stagesDesc: "PreFlop (2 karty własne) → Flop (3 karty wspólne) → Turn (4. karta) → River (5. karta) → Showdown (porównanie układów).",
      cardHands: "Układy kart",
      handsDesc: "Od najsłabszego: Wysoka karta, Para, Dwie pary, Trójka, Strit, Kolor, Full, Kareta, Poker, Poker królewski.",
      fold: "PAS (Fold)",
      foldDesc: "Rezygnujesz z rozdania i tracisz wpłacone żetony. Użyj gdy masz słabe karty.",
      check: "CZEKAJ (Check)",
      checkDesc: "Przechodzisz dalej bez wpłacania, gdy nikt nie podniósł stawki.",
      call: "SPRAWDŹ (Call)",
      callDesc: "Wyrównujesz aktualną stawkę przeciwnika, aby zostać w grze.",
      raise: "PODBIJ (Raise)",
      raiseDesc: "Podnosisz stawkę - musisz podbić co najmniej do aktualnego minimum + 1$. Wpisz kwotę i kliknij PODBIJ.",
      allIn: "ALL-IN",
      allInDesc: "Stawiasz wszystkie swoje żetony. Automatyczne gdy podbijasz więcej niż masz.",
      observeOpponents: "Obserwuj zachowanie przeciwników - częste podbijanie może oznaczać silną rękę.",
      dontFearFold: "Nie bój się pasować przy słabych kartach - oszczędność żetonów to też strategia.",
      positionMatters: "Pozycja ma znaczenie - grając jako ostatni masz więcej informacji.",
      manageBankroll: "Zarządzaj swoim bankrollem - nie ryzykuj wszystkiego na jedną rękę.",
      // Blackjack
      blackjackTitle: "Blackjack (Oczko)",
      blackjackDesc: "Klasyczna gra karciana. Zbierz karty o wartości jak najbliższej 21, ale nie przekrocz tej liczby!",
      beatDealer: "Pokonaj krupiera mając więcej punktów (max 21). Przekroczenie 21 = przegrana.",
      cardValues: "Wartości kart",
      valuesDesc: "2-10 = wartość nominalna, J/Q/K = 10 punktów, As = 1 lub 11 punktów.",
      blackjack: "Blackjack",

      dealer: "Krupier",
      dealerDesc: "Krupier musi dobierać do 16 i stać na 17+.",
      hit: "DOBIERZ (Hit)",
      hitDesc: "Dobierz kolejną kartę. Ryzykujesz przekroczenie 21!",
      stand: "STÓJ (Stand)",
      standDesc: "Zatrzymaj obecną sumę i pozwól krupierowi grać.",
      double: "PODWÓJ (Double)",
      doubleDesc: "Podwój zakład i dobierz dokładnie jedną kartę (dostępne tylko na początku).",
      placeBet: "POSTAW (Bet)",
      placeBetDesc: "Ustaw wysokość zakładu przed rozdaniem kart.",
      alwaysDouble11: "Przy sumie 11 zawsze podwajaj (jeśli możesz).",
      standAt17: "Stój przy 17+ - ryzyko przekroczenia 21 jest zbyt wysokie.",
      hitAt11Less: "Dobieraj przy sumie 11 lub mniej - nie możesz przegrać.",
      watchDealerCard: "Obserwuj odkrytą kartę krupiera - jeśli ma 6 lub mniej, częściej przekroczy 21.",
      // Roulette
      rouletteTitle: "Ruletka",
      rouletteDesc: "Klasyczna gra kasynowa - postaw na numer, kolor lub zakres i czekaj na wynik!",
      predictNumber: "Przewiduj, na którym numerze zatrzyma się kulka. Wygrana zależy od typu zakładu.",
      numbers: "Numery",
      numbersDesc: "Ruletka europejska ma numery 0-36. Zero jest zielone, reszta to czerwone i czarne.",
      payouts: "Wypłaty",
      payoutsDesc: "Numer: 35:1 | Kolor: 1:1 | Parzyste/Nieparzyste: 1:1 | Połowa (1-18/19-36): 1:1",
      selectChip: "Wybierz żeton",
      selectChipDesc: "Kliknij na żeton (10, 50, 100 lub 500) aby wybrać wartość zakładu.",
      placeBetRoulette: "Postaw zakład",
      placeBetRouletteDesc: "Kliknij na stole w miejsce gdzie chcesz postawić - numer, kolor, parzyste itp.",
      spin: "SPIN",
      spinDesc: "Zakręć kołem ruletki i czekaj na wynik!",
      clearBets: "Wyczyść zakłady",
      clearBetsDesc: "Usuń wszystkie postawione zakłady przed spinem.",
      outsideBets: "Zakłady zewnętrzne (kolor, parzyste) mają większą szansę wygranej, ale mniejszą wypłatę.",
      multipleBeats: "Możesz postawić wiele zakładów naraz - strategia pokrycia wielu numerów.",
      zeroHouseEdge: "Zero daje przewagę kasynu - unikaj zakładów tylko na zero.",
      setBettingLimit: "Ustal limit zakładów i trzymaj się go!",
      // Slots
      slotsTitle: "Automaty (Slots)",
      slotsDesc: "Klasyczne jednorękie bandyty - pociągnij za dźwignię i wygraj!",
      lineUpSymbols: "Ułóż 3 takie same symbole w linii, aby wygrać. Różne symbole dają różne mnożniki.",
      symbols: "Symbole",
      symbolsDesc: "🍋 Cytryna (2x) | 🍒 Wiśnie (3x) | 🍇 Winogrona (5x) | 🔔 Dzwonek (10x) | ☘️ Koniczyna (15x) | 7️⃣ Siódemka (25x) | 💎 Diament (50x)",
      winningLines: "Linie wygrywające",
      winningLinesDesc: "Wygrana następuje gdy 3 takie same symbole pojawią się w środkowym rzędzie.",
      setBet: "Ustaw zakład",
      setBetDesc: "Użyj przycisków - i + lub wpisz kwotę zakładu.",
      pull: "POCIĄGNIJ / SPIN",
      pullDesc: "Kliknij dźwignię lub przycisk SPIN aby zakręcić bębnami.",
      diamondsHighest: "Diamenty dają najwyższą wygraną (50x), ale są najrzadsze.",
      sevensSecond: "Siódemki to drugi najlepszy symbol (25x stawki).",
      playResponsibly: "Graj rozsądnie - automaty są losowe, nie ma \"gorących\" maszyn.",
      setLossLimit: "Ustaw limit strat przed rozpoczęciem gry."
    },
    helpOverlay: {
      title: "📚 Pomoc",
      blackjack: {
        title: "♠️ Blackjack Solo",
        goal: {
          title: "🎯 Cel gry",
          desc: "Zbierz karty o wartości jak najbliższej 21 punktów, nie przekraczając tej liczby. Pokonaj krupiera!"
        },
        cards: {
          title: "🃏 Wartości kart",
          desc: "• 2-10 = wartość nominalna<br>• J, Q, K = 10 punktów<br>• As = 1 lub 11 punktów (automatycznie)<br>• Blackjack (As + 10/J/Q/K) = natychmiastowa wygrana 1.5x!"
        },
        actions: {
          title: "🎮 Dostępne akcje",
          desc: "<strong>DOBIERZ (Hit)</strong> - Weź kolejną kartę<br><strong>STÓJ (Stand)</strong> - Zachowaj obecny wynik<br><strong>PODWÓJ (Double)</strong> - Podwój zakład, dobierz 1 kartę i stój"
        },
        rules: {
          title: "📋 Zasady",
          desc: "• Krupier dobiera do 16, stoi na 17+<br>• Przekroczenie 21 = przegrana (bust)<br>• Remis = zwrot zakładu<br>• Blackjack bije 21 z więcej kart"
        },
        tips: {
          title: "💡 Wskazówki",
          desc: "• Podwajaj zawsze na 11<br>• Stój na 17 lub więcej<br>• Dobieraj na 11 lub mniej<br>• Jeśli krupier ma 6 lub mniej - częściej przekroczy 21"
        }
      },
      blackjackMultiplayer: {
        title: "♠️ Blackjack Multiplayer",
        goal: {
          title: "🎯 Cel gry",
          desc: "Te same zasady co w solo, ale grasz z innymi graczami przy wspólnym stole przeciwko krupierowi!"
        },
        betting: {
          title: "⏱️ Faza obstawiania",
          desc: "• Masz <strong>30 sekund</strong> na postawienie zakładu<br>• Runda startuje automatycznie po upływie czasu<br>• Pierwszy gracz który postawi uruchamia timer<br>• Możesz zmienić zakład do końca odliczania"
        },
        gameplay: {
          title: "🎮 Rozgrywka",
          desc: "• Gracze podejmują decyzje po kolei<br>• Czekaj na swoją turę (podświetlenie)<br>• Krupier gra jako ostatni<br>• Każdy gracz gra niezależnie przeciwko krupierowi"
        },
        chat: {
          title: "💬 Czat",
          desc: "• Komunikuj się z graczami przy stole<br>• Czat w prawym dolnym rogu<br>• Bądź kulturalny!"
        },
        tips: {
          title: "💡 Wskazówki",
          desc: "• Obserwuj decyzje innych graczy<br>• Nie spiesz się - masz czas<br>• Używaj czatu do strategii zespołowej"
        }
      },
      poker: {
        title: "♦️ Video Poker",
        goal: {
          title: "🎯 Cel gry",
          desc: "Graj przeciwko krupierowi. Stwórz lepszy układ 5 kart i wygraj 2x stawkę!"
        },
        hands: {
          title: "🏆 Układy kart (od najsłabszego)",
          desc: "• Wysoka karta<br>• Para<br>• Dwie pary<br>• Trójka<br>• Strit (5 kart po kolei)<br>• Kolor (5 kart tej samej maści)<br>• Full (trójka + para)<br>• Kareta<br>• Poker (strit w kolorze)<br>• Poker królewski (10-A w kolorze)"
        },
        gameplay: {
          title: "🎮 Jak grać",
          desc: "1. Wpisz lub ustaw stawkę<br>2. Kliknij ROZDAJ<br>3. Wybierz karty do wymiany (max 4)<br>4. Kliknij WYMIEŃ lub ZOSTAW<br>5. Porównaj układ z krupierem!"
        },
        payouts: {
          title: "💰 Wypłaty",
          desc: "<strong>Wygrana = 2x stawka</strong><br>Pokonaj krupiera mając lepszy układ kart.<br>W przypadku remisu - zwrot stawki."
        },
        tips: {
          title: "💡 Wskazówki",
          desc: "• Trzymaj parę lub lepiej<br>• Przy 4 do koloru/strita - wymieniaj jedną<br>• Wysoka karta rzadko wygrywa"
        }
      },
      pokerMultiplayer: {
        title: "♦️ Texas Hold'em Multiplayer",
        goal: {
          title: "🎯 Cel gry",
          desc: "Wygraj pulę mając najlepszy układ 5 kart (z 2 własnych + 5 wspólnych) lub zmuszając wszystkich do spasowania!"
        },
        ante: {
          title: "💵 Ante i start",
          desc: "• Każdy gracz wpłaca <strong>ante 100$</strong><br>• <strong>Jeśli nie masz na ante - automatycznie pasujesz!</strong><br>• Gra startuje gdy wszyscy są gotowi (30s)<br>• Kliknij 'GOTOWY' aby dołączyć do rundy"
        },
        phases: {
          title: "📋 Fazy gry",
          desc: "1. <strong>Pre-flop</strong> - 2 karty własne<br>2. <strong>Flop</strong> - 3 karty wspólne<br>3. <strong>Turn</strong> - 4. karta wspólna<br>4. <strong>River</strong> - 5. karta wspólna<br>5. <strong>Showdown</strong> - porównanie układów"
        },
        actions: {
          title: "🎮 Dostępne akcje",
          desc: "<strong>CHECK</strong> - Czekaj (gdy nikt nie podbił)<br><strong>CALL</strong> - Wyrównaj stawkę<br><strong>RAISE</strong> - Podbij stawkę<br><strong>FOLD</strong> - Pas (tracisz wpłacone)<br><strong>ALL-IN</strong> - Wszystkie żetony"
        },
        tips: {
          title: "💡 Wskazówki",
          desc: "• Pozycja ma znaczenie - ostatni wie więcej<br>• Nie bój się pasować słabych kart<br>• Obserwuj zakłady przeciwników<br>• Blef działa lepiej przeciw 1-2 graczom"
        }
      },
      roulette: {
        title: "🎡 Ruletka",
        goal: {
          title: "🎯 Cel gry",
          desc: "Przewiduj gdzie zatrzyma się kulka. Wyższa wygrana = mniejsza szansa!"
        },
        numbers: {
          title: "🔢 Numery",
          desc: "• Ruletka europejska: 0-36<br>• Zero (0) = zielone<br>• Pozostałe = czerwone i czarne naprzemiennie"
        },
        bets: {
          title: "💰 Typy zakładów i wypłaty",
          desc: "<strong>Numer</strong> (35:1) - jeden numer<br><strong>Split</strong> (17:1) - 2 sąsiednie<br><strong>Street</strong> (11:1) - rząd 3 numerów<br><strong>Corner</strong> (8:1) - 4 numery<br><strong>Kolor</strong> (1:1) - czerwone/czarne<br><strong>Parzyste</strong> (1:1) - parzyste/nieparzyste<br><strong>Połowa</strong> (1:1) - 1-18 lub 19-36"
        },
        gameplay: {
          title: "🎮 Jak grać",
          desc: "1. Wybierz żeton (10/50/100/500)<br>2. Kliknij na stole gdzie chcesz postawić<br>3. Możesz postawić wiele zakładów<br>4. Kliknij SPIN<br>5. Czekaj na wynik!"
        },
        tips: {
          title: "💡 Wskazówki",
          desc: "• Zakłady zewnętrzne (kolor) = bezpieczniejsze<br>• Zero daje przewagę kasynu<br>• Ustal limit i trzymaj się go<br>• Nie istnieją 'gorące' numery"
        }
      },
      slots: {
        title: "🎰 Automaty",
        goal: {
          title: "🎯 Cel gry",
          desc: "Ułóż minimum 3 takie same symbole na jednej z 10 linii wygrywających!"
        },
        symbols: {
          title: "🍀 Symbole i mnożniki",
          desc: "🍋 Cytryna = 2x<br>🍒 Wiśnie = 3x<br>🍇 Winogrona = 5x<br>🔔 Dzwonek = 10x<br>☘️ Koniczyna = 15x<br>7️⃣ Siódemka = 25x<br>💎 Diament = 50x"
        },
        gameplay: {
          title: "🎮 Jak grać",
          desc: "1. Wpisz lub ustaw stawkę (+/-)<br>2. Kliknij SPIN lub pociągnij dźwignię<br>3. Bębny się zatrzymują<br>4. Wygrane linie zostają podświetlone!"
        },
        rules: {
          title: "📋 10 linii wygrywających",
          desc: "• 3 rzędy poziome<br>• 2 linie diagonalne (V i Λ)<br>• 2 linie V od góry/dołu<br>• 3 linie zygzakowe<br>• Wystarczą 3+ symbole od lewej!"
        },
        tips: {
          title: "💡 Wskazówki",
          desc: "• Diamenty = najwyższa wygrana (50x)<br>• Można wygrać na wielu liniach naraz!<br>• Ustal limit strat PRZED grą<br>• Każdy spin jest losowy"
        }
      }
    }
  },
  en: {
    common: {
      welcome: "Welcome",
      login: "Log in",
      register: "Sign up",
      logout: "Log out",
      logOut: "Log out",
      home: "Home",
      profile: "Profile",
      admin: "Admin panel",
      settings: "Settings",
      language: "Language",
      balance: "Balance",
      loading: "Status",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      back: "Back",
      play: "Play",
      bet: "Bet",
      spin: "Spin",
      deal: "Deal",
      hit: "Hit",
      stand: "Stand",
      double: "Double",
      split: "Split",
      save: "Save",
      close: "Close",
      deposit: "Deposit",
      withdraw: "Withdraw",
      history: "History",
      characters: "characters",
      you: "You"
    },
    nav: {
      games: "Games",
      slots: "Slots",
      roulette: "Roulette",
      blackjack: "Blackjack",
      poker: "Poker"
    },
    auth: {
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset password",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      loginSuccess: "Successfully logged in",
      registerSuccess: "Registration successful",
      name: "First name",
      surname: "Last name",
      signUp: "Sign up",
      enterEmail: "Enter email",
      enterPassword: "Enter password",
      confirmYourPassword: "Confirm password",
      invalidEmail: "Invalid email address",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 6 characters",
      userExists: "User with this email already exists",
      invalidCredentials: "Invalid email or password",
      confirmEmail: "Please confirm your email before logging in"
    },
    games: {
      blackjack: {
        title: "Blackjack",
        description: "Beat the dealer and get 21!",
        selectMode: "Choose game mode",
        classicBlackjack: "Classic Blackjack",
        classicDescription: "Classic blackjack. Play alone against the dealer and perfect your skills.",
        playSolo: "Play Solo",
        multiplayer21: "Multiplayer 21",
        multiplayerDescription: "Real emotions at the table! Join other players and beat the dealer together.",
        joinTable: "Join Table",
        singlePlayer: "Single player",
        multiplayer: "Multiplayer",
        lobby: "Lobby",
        dealer: "Dealer",
        dealerScore: "Dealer score",
        dealerCards: "Dealer Cards",
        yourScore: "Your score",
        betAmount: "Bet amount",
        winAmount: "Win amount",
        dealCards: "DEAL CARDS",
        dealing: "DEALING...",
        hit: "HIT",
        stand: "STAND",
        double: "DOUBLE",
        win: "WIN!",
        blackjack: "BLACKJACK!",
        lose: "LOSE",
        push: "PUSH",
        waiting: "Waiting...",
        dealToStart: "Deal cards to play",
        currentBet: "Bet: {{bet}} PLN",
        invalidBet: "Enter amount greater than 0",
        insufficientBalance: "Insufficient balance",
        gameError: "Error starting game",
        hitError: "Error during hit",
        standError: "Error during stand",
        doubleError: "Error during double",
        showLeaderboard: "Show leaderboard",
        hideLeaderboard: "Hide leaderboard",
        connecting: "Connecting to the casino...",
        enteringTable: "Entering the table...",
        tableLabel: "Table",
        stageLabel: "Stage",
        leaveTable: "Leave",
        yourTurn: "Your turn",
        historyTitle: "Game history",
        tableChat: "Table chat",
        startChat: "Start the conversation...",
        chatPlaceholder: "Write a message...",
        placeBet: "Place bet",
        roundStartsIn: "Round starts in",
        waitingForOthers: "Waiting for other players..."
      },
      roulettePage: {
        title: "Roulette",
        placeBet: "Place bet",
        selectNumber: "Select number",
        selectColor: "Select color",
        red: "Red",
        black: "Black",
        even: "Even",
        odd: "Odd"
      },
      poker: {
        title: "Poker",
        description: "Play Texas Hold'em",
        selectMode: "Choose game mode",
        royalPoker: "Royal Poker",
        royalDescription: "Practice makes perfect. Play against the dealer and perfect your skills.",
        playSolo: "Play Solo",
        texasHoldem: "Texas Hold'em",
        texasDescription: "Real emotions at the table! Join other players and fight for the highest stakes.",
        joinTable: "Join Table",
        singlePlayer: "Single player",
        multiplayer: "Multiplayer",
        lobby: "Lobby",
        fold: "Fold",
        call: "Call",
        raise: "Raise",
        check: "Check",
        allIn: "All-in",
        yourCards: "Your cards",
        communityCards: "Community cards",
        pot: "Pot",
        turn: "Your turn",
        bet: "Bet",
        waiting: "Waiting...",
        dealToStart: "Deal cards to play",
        dealCards: "DEAL CARDS",
        dealing: "SHUFFLING...",
        nextRound: "NEXT ROUND",
        selectCards: "Select cards to exchange",
        selectedCards: "Selected to exchange: {{count}}",
        exchange: "EXCHANGE CARDS",
        win: "WIN!",
        lose: "LOSE",
        gameStartError: "Start error",
        gameExchangeError: "Exchange error",
        showLeaderboard: "Show leaderboard",
        hideLeaderboard: "Hide leaderboard",
        connecting: "Connecting to the casino...",
        enteringTable: "Entering the table...",
        tableLabel: "Table",
        stageLabel: "Stage",
        leaveTable: "Leave",
        historyTitle: "Game history",
        tableChat: "Table chat",
        startChat: "Start the conversation...",
        chatPlaceholder: "Write a message...",
        folded: "Folded",
        youFolded: "You folded",
        ready: "Ready",
        setReady: "I'm ready",
        playersReady: "Players ready",
        startingIn: "Starting in"
      },
      slots: {
        title: "Slot Machines",
        description: "Play slots and win!",
        dealCards: "SPIN",
        bet: "Bet",
        invalidBet: "Enter amount greater than 0",
        insufficientBalance: "Insufficient balance",
        gameError: "Game error",
        win: "WIN!",
        multiplier: "x",
        showLeaderboard: "Show leaderboard",
        hideLeaderboard: "Hide leaderboard"
      },
      roulette: {
        title: "Roulette",
        description: "Place your bets and spin!",
        placeBet: "Place bet",
        selectNumber: "Select number",
        selectColor: "Select color",
        red: "Red",
        black: "Black",
        even: "Even",
        odd: "Odd",
        low: "Low",
        high: "High",
        bet: "Bet",
        spin: "SPIN",
        gameError: "Game error",
        win: "WIN!",
        invalidBet: "Enter amount greater than 0",
        insufficientBalance: "Insufficient balance",
        showLeaderboard: "Show leaderboard",
        hideLeaderboard: "Hide leaderboard"
      }
    },
    profile: {
      title: "Your profile",
      userInfo: "User information",
      statistics: "Statistics",
      gamesPlayed: "Games played",
      totalWins: "Wins",
      totalLosses: "Losses",
      winRate: "Win rate",
      missions: "Missions",
      dailyMissions: "Daily missions",
      dailyRewards: "Daily rewards",
      streak: "Streak",
      days: "days",
      claimReward: "Claim reward",
      nextRewardIn: "Next reward in",
      name: "First name",
      surname: "Last name",
      email: "Email",
      vipStatus: "VIP Status",
      isVip: "Yes, I'm VIP",
      notVip: "Not VIP",
      changePassword: "Change password",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      security: "Security",
      changePasswordTitle: "Change password",
      changePasswordButton: "CHANGE PASSWORD",
      deleteAccountButton: "DELETE ACCOUNT",
      deleteAccount: "Delete account",
      deleteAccountTitle: "Delete account",
      deleteAccountWarning: "⚠️ Warning!",
      deleteAccountText: "This action is irreversible. All your data, game history and balance will be permanently deleted.",
      deleteAccountConfirm: "Are you sure you want to delete your account?",
      enterPasswordToConfirm: "Enter your password to confirm",
      allFieldsRequired: "All fields are required",
      passwordMinLength: "New password must be at least 6 characters",
      passwordNotMatching: "New passwords do not match",
      passwordChangedSuccess: "Password changed successfully",
      passwordChanged: "Password has been changed",
      passwordChangeError: "Failed to change password",
      invalidPassword: "Invalid password",
      deleteAccountError: "Failed to delete account",
      deleteAccountSuccess: "Account has been successfully deleted",
      keepAccount: "No, keep my account",
      confirmDeleteAccount: "Yes, delete my account",
      cancel: "Cancel",
      transactions: "Transactions",
      gameHistory: "Game history",
      noTransactions: "No transactions",
      noGameHistory: "No game history",
      loadMore: "Load more",
      depositFunds: "Deposit funds",
      withdrawFunds: "Withdraw funds",
      enterAmount: "Enter amount",
      minimumAmount: "Minimum",
      maximumAmount: "Maximum",
      processingPayment: "Processing payment...",
      balance: "Balance",
      type: "Type",
      outcome: "Outcome",
      winAmount: "Win amount",
      date: "Date",
      win: "Win",
      lose: "Lose"
    },
    missions: {
      title: "Missions",
      daily: "Daily",
      completed: "Completed",
      inProgress: "In progress",
      reward: "Reward",
      progress: "Progress",
      claim: "Claim",
      claimed: "Claimed",
      complete: "Complete",
      completionReward: "Completion reward"
    },
    admin: {
      title: "Admin Panel",
      users: "Users",
      userManagement: "User Management",
      email: "Email",
      name: "First name",
      surname: "Last name",
      balance: "Balance",
      isVip: "VIP",
      firstName: "First name",
      lastName: "Last name",
      active: "Active",
      vip: "VIP",
      searchPlaceholder: "🔍 Search user...",
      id: "ID",
      status: "Status",
      noPermissions: "Admin permissions required",
      serverError: "Server error",
      loading: "⏳ Loading...",
      error: "❌ Error",
      confirmDelete: "Are you sure you want to delete this user?",
      userDeleted: "User deleted",
      deleteError: "Error while deleting user",
      updateBalance: "Change balance",
      enterBalance: "Enter new balance:",
      balanceUpdated: "Balance updated",
      updateError: "Error while updating balance",
      previous: "← Previous",
      next: "Next →",
      page: "Page",
      of: "/"
    },
    lobby: {
      title: "Lobby",
      createTable: "Create table",
      joinTable: "Join table",
      availableTables: "Available tables",
      tableName: "Table name",
      minBet: "Minimum bet",
      maxBet: "Maximum bet",
      maxPlayers: "Max players",
      currentPlayers: "Current players",
      waiting: "Waiting...",
      players: "Players",
      status: "Status",
      startGame: "Start game",
      joinGame: "Join game",
      full: "Full",
      inProgress: "In progress",
      selectTable: "Choose a table and start playing",
      playNow: "Play now",
      minBuyIn: "Min. buy-in",
      loadingTables: "Loading tables..."
    },
    help: {
      help: "Help",
      howToPlay: "How to play?",
      rules: "Game rules",
      actions: "Available actions",
      tips: "Tips",
      // Poker
      pokerTitle: "Texas Hold'em Poker",
      pokerDesc: "A card game where the goal is to get the best 5-card hand from 7 available cards (2 own + 5 community).",
      goalOfGame: "Goal of the game",
      winPot: "Win the pot by having the best card hand or forcing all opponents to fold.",
      ante: "Ante",
      anteDesc: "At the beginning of each hand, each player antes ($100) to the starting pot.",
      gameStages: "Game stages",
      stagesDesc: "PreFlop (2 own cards) → Flop (3 community cards) → Turn (4th card) → River (5th card) → Showdown (compare hands).",
      cardHands: "Card hands",
      handsDesc: "From weakest to strongest: High card, Pair, Two pair, Three of a kind, Straight, Flush, Full house, Four of a kind, Straight flush, Royal flush.",
      fold: "FOLD",
      foldDesc: "You give up the hand and lose your chips. Use when you have weak cards.",
      check: "CHECK",
      checkDesc: "You proceed without betting when no one has raised.",
      call: "CALL",
      callDesc: "You match the opponent's current bet to stay in the game.",
      raise: "RAISE",
      raiseDesc: "You increase the bet - you must raise to at least the current minimum + $1. Enter the amount and click RAISE.",
      allIn: "ALL-IN",
      allInDesc: "You bet all your chips. Automatic when you raise more than you have.",
      observeOpponents: "Observe opponents' behavior - frequent raises may indicate a strong hand.",
      dontFearFold: "Don't be afraid to fold weak cards - saving chips is also a strategy.",
      positionMatters: "Position matters - playing last gives you more information.",
      manageBankroll: "Manage your bankroll - don't risk everything on one hand.",
      // Blackjack
      blackjackTitle: "Blackjack",
      blackjackDesc: "A classic card game. Collect cards worth as close to 21 as possible, but don't exceed it!",
      beatDealer: "Beat the dealer by having more points (max 21). Going over 21 = loss.",
      cardValues: "Card values",
      valuesDesc: "2-10 = face value, J/Q/K = 10 points, Ace = 1 or 11 points.",
      blackjack: "Blackjack",
    
      dealer: "Dealer",
      dealerDesc: "Dealer must hit to 16 and stand on 17+.",
      hit: "HIT",
      hitDesc: "Draw another card. Risk going over 21!",
      stand: "STAND",
      standDesc: "Keep your current total and let the dealer play.",
      double: "DOUBLE",
      doubleDesc: "Double your bet and draw exactly one card (available only at the start).",
      placeBet: "BET",
      placeBetDesc: "Set bet amount before cards are dealt.",
      alwaysDouble11: "Always double on 11 (if you can) - you can't bust.",
      standAt17: "Stand on 17+ - the risk of going over 21 is too high.",
      hitAt11Less: "Hit on 11 or less - you can't bust.",
      watchDealerCard: "Watch the dealer's up card - if it's 6 or lower, they often bust.",
      // Roulette
      rouletteTitle: "Roulette",
      rouletteDesc: "A classic casino game - bet on a number, color, or range and wait for the result!",
      predictNumber: "Predict which number the ball will land on. Winnings depend on the bet type.",
      numbers: "Numbers",
      numbersDesc: "European roulette has numbers 0-36. Zero is green, the rest are red and black.",
      payouts: "Payouts",
      payoutsDesc: "Number: 35:1 | Color: 1:1 | Even/Odd: 1:1 | Half (1-18/19-36): 1:1",
      selectChip: "Select chip",
      selectChipDesc: "Click on a chip (10, 50, 100, or 500) to select your bet value.",
      placeBetRoulette: "Place bet",
      placeBetRouletteDesc: "Click on the table where you want to bet - number, color, even, etc.",
      spin: "SPIN",
      spinDesc: "Spin the roulette wheel and wait for the result!",
      clearBets: "Clear bets",
      clearBetsDesc: "Remove all placed bets before spinning.",
      outsideBets: "Outside bets (color, even) have higher chance of winning, but lower payout.",
      multipleBeats: "You can place multiple bets at once - a strategy to cover many numbers.",
      zeroHouseEdge: "Zero gives the house an edge - avoid betting only on zero.",
      setBettingLimit: "Set a betting limit and stick to it!",
      // Slots
      slotsTitle: "Slots",
      slotsDesc: "Classic one-armed bandits - pull the lever and win!",
      lineUpSymbols: "Line up 3 matching symbols to win. Different symbols give different multipliers.",
      symbols: "Symbols",
      symbolsDesc: "🍋 Lemon (2x) | 🍒 Cherries (3x) | 🍇 Grapes (5x) | 🔔 Bell (10x) | ☘️ Clover (15x) | 7️⃣ Seven (25x) | 💎 Diamond (50x)",
      winningLines: "Winning lines",
      winningLinesDesc: "You win when 3 matching symbols appear in the middle row.",
      setBet: "Set bet",
      setBetDesc: "Use + and - buttons or enter the bet amount.",
      pull: "PULL / SPIN",
      pullDesc: "Click the lever or SPIN button to spin the reels.",
      diamondsHighest: "Diamonds give the highest payout (50x), but are the rarest.",
      sevensSecond: "Sevens are the second best symbol (25x the bet).",
      playResponsibly: "Play responsibly - slots are random, there are no 'hot' machines.",
      setLossLimit: "Set a loss limit before you start playing."
    },
    validation: {
      required: "This field is required",
      invalidEmail: "Invalid email address",
      passwordTooShort: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      amountInvalid: "Invalid amount",
      amountTooSmall: "Amount too small",
      insufficientBalance: "Insufficient balance"
    },
    helpOverlay: {
      title: "📚 Help",
      blackjack: {
        title: "♠️ Blackjack Solo",
        goal: {
          title: "🎯 Goal",
          desc: "Get cards as close to 21 as possible without going over. Beat the dealer!"
        },
        cards: {
          title: "🃏 Card Values",
          desc: "• 2-10 = face value<br>• J, Q, K = 10 points<br>• Ace = 1 or 11 (automatic)<br>• Blackjack (Ace + 10/J/Q/K) = instant 1.5x win!"
        },
        actions: {
          title: "🎮 Actions",
          desc: "<strong>HIT</strong> - Draw another card<br><strong>STAND</strong> - Keep current total<br><strong>DOUBLE</strong> - Double bet, draw 1 card and stand"
        },
        rules: {
          title: "📋 Rules",
          desc: "• Dealer hits to 16, stands on 17+<br>• Over 21 = bust (lose)<br>• Tie = push (bet returned)<br>• Blackjack beats regular 21"
        },
        tips: {
          title: "💡 Tips",
          desc: "• Always double on 11<br>• Stand on 17 or higher<br>• Hit on 11 or less<br>• If dealer shows 6 or less - they often bust"
        }
      },
      blackjackMultiplayer: {
        title: "♠️ Blackjack Multiplayer",
        goal: {
          title: "🎯 Goal",
          desc: "Same rules as solo, but play with other players at one table against the dealer!"
        },
        betting: {
          title: "⏱️ Betting Phase",
          desc: "• You have <strong>30 seconds</strong> to place your bet<br>• Round starts automatically when time runs out<br>• First player to bet starts the timer<br>• You can change your bet until countdown ends"
        },
        gameplay: {
          title: "🎮 Gameplay",
          desc: "• Players take turns making decisions<br>• Wait for your turn (highlighted)<br>• Dealer plays last<br>• Each player plays independently vs dealer"
        },
        chat: {
          title: "💬 Chat",
          desc: "• Communicate with players at the table<br>• Chat in bottom right corner<br>• Be respectful!"
        },
        tips: {
          title: "💡 Tips",
          desc: "• Watch other players' decisions<br>• Don't rush - you have time<br>• Use chat for team strategy"
        }
      },
      poker: {
        title: "♦️ Video Poker",
        goal: {
          title: "🎯 Goal",
          desc: "Play against the dealer. Create a better 5-card hand and win 2x your bet!"
        },
        hands: {
          title: "🏆 Hand Rankings (lowest to highest)",
          desc: "• High Card<br>• Pair<br>• Two Pair<br>• Three of a Kind<br>• Straight (5 in sequence)<br>• Flush (5 same suit)<br>• Full House (3+2)<br>• Four of a Kind<br>• Straight Flush<br>• Royal Flush (10-A same suit)"
        },
        gameplay: {
          title: "🎮 How to Play",
          desc: "1. Type or set your bet<br>2. Click DEAL<br>3. Select cards to discard (max 4)<br>4. Click DRAW or HOLD<br>5. Compare hands with dealer!"
        },
        payouts: {
          title: "💰 Payouts",
          desc: "<strong>Win = 2x your bet</strong><br>Beat the dealer with a better hand.<br>Tie = bet returned."
        },
        tips: {
          title: "💡 Tips",
          desc: "• Always keep a pair or better<br>• With 4 to flush/straight - draw one<br>• High card rarely wins"
        }
      },
      pokerMultiplayer: {
        title: "♦️ Texas Hold'em Multiplayer",
        goal: {
          title: "🎯 Goal",
          desc: "Win the pot with the best 5-card hand (from 2 hole + 5 community) or make everyone fold!"
        },
        ante: {
          title: "💵 Ante & Start",
          desc: "• Every player pays <strong>$100 ante</strong><br>• <strong>If you can't afford ante - auto fold!</strong><br>• Game starts when all are ready (30s)<br>• Click 'READY' to join the round"
        },
        phases: {
          title: "📋 Game Phases",
          desc: "1. <strong>Pre-flop</strong> - 2 hole cards<br>2. <strong>Flop</strong> - 3 community cards<br>3. <strong>Turn</strong> - 4th community card<br>4. <strong>River</strong> - 5th community card<br>5. <strong>Showdown</strong> - compare hands"
        },
        actions: {
          title: "🎮 Actions",
          desc: "<strong>CHECK</strong> - Pass (if no one raised)<br><strong>CALL</strong> - Match current bet<br><strong>RAISE</strong> - Increase the bet<br><strong>FOLD</strong> - Give up (lose what you bet)<br><strong>ALL-IN</strong> - Bet all your chips"
        },
        tips: {
          title: "💡 Tips",
          desc: "• Position matters - last to act knows more<br>• Don't be afraid to fold weak cards<br>• Watch opponents' betting patterns<br>• Bluffs work better vs 1-2 players"
        }
      },
      roulette: {
        title: "🎡 Roulette",
        goal: {
          title: "🎯 Goal",
          desc: "Predict where the ball will land. Higher payout = lower chance!"
        },
        numbers: {
          title: "🔢 Numbers",
          desc: "• European roulette: 0-36<br>• Zero (0) = green<br>• Others = alternating red and black"
        },
        bets: {
          title: "💰 Bet Types & Payouts",
          desc: "<strong>Number</strong> (35:1) - single number<br><strong>Split</strong> (17:1) - 2 adjacent<br><strong>Street</strong> (11:1) - row of 3<br><strong>Corner</strong> (8:1) - 4 numbers<br><strong>Color</strong> (1:1) - red/black<br><strong>Even</strong> (1:1) - even/odd<br><strong>Half</strong> (1:1) - 1-18 or 19-36"
        },
        gameplay: {
          title: "🎮 How to Play",
          desc: "1. Select chip (10/50/100/500)<br>2. Click on table where to bet<br>3. Place multiple bets if you want<br>4. Click SPIN<br>5. Wait for result!"
        },
        tips: {
          title: "💡 Tips",
          desc: "• Outside bets (color) = safer<br>• Zero gives house edge<br>• Set a limit and stick to it<br>• There are no 'hot' numbers"
        }
      },
      slots: {
        title: "🎰 Slots",
        goal: {
          title: "🎯 Goal",
          desc: "Line up at least 3 matching symbols on one of 10 paylines to win!"
        },
        symbols: {
          title: "🍀 Symbols & Multipliers",
          desc: "🍋 Lemon = 2x<br>🍒 Cherries = 3x<br>🍇 Grapes = 5x<br>🔔 Bell = 10x<br>☘️ Clover = 15x<br>7️⃣ Seven = 25x<br>💎 Diamond = 50x"
        },
        gameplay: {
          title: "🎮 How to Play",
          desc: "1. Type or set your bet (+/-)<br>2. Click SPIN or pull lever<br>3. Reels stop spinning<br>4. Winning lines get highlighted!"
        },
        rules: {
          title: "📋 10 Paylines",
          desc: "• 3 horizontal rows<br>• 2 diagonal lines (V and Λ)<br>• 2 V-shaped from top/bottom<br>• 3 zigzag patterns<br>• 3+ symbols from left wins!"
        },
        tips: {
          title: "💡 Tips",
          desc: "• Diamonds = highest payout (50x)<br>• Can win on multiple lines at once!<br>• Set loss limit BEFORE playing<br>• Each spin is random"
        }
      }
    }
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'pl') ? saved : 'pl';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Expose help translations to window object for helpOverlay.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__HELP_TRANSLATIONS__ = {
        pl: translations.pl.helpOverlay,
        en: translations.en.helpOverlay
      };
    }
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback do klucza jeśli nie znajdzie
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
