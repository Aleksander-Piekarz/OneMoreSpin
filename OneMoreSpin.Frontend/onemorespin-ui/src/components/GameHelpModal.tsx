import { useState } from 'react';
import '../styles/GameHelpModal.css';

export interface GameRule {
  title: string;
  description: string;
  icon?: string;
}

export interface GameAction {
  name: string;
  description: string;
  icon?: string;
}

export interface GameHelpContent {
  title: string;
  shortDescription: string;
  rules: GameRule[];
  actions: GameAction[];
  tips?: string[];
}

interface GameHelpModalProps {
  content: GameHelpContent;
  position?: 'header' | 'floating' | 'prominent';
}

// Predefiniowane treści pomocy dla różnych gier
export const POKER_HELP: GameHelpContent = {
  title: "Texas Hold'em Poker",
  shortDescription: "Gra karciana, w której celem jest zdobycie najlepszego układu 5 kart z 7 dostępnych (2 własne + 5 wspólnych).",
  rules: [
    {
      title: "Cel gry",
      description: "Wygraj pulę mając najlepszy układ kart lub zmuszając wszystkich przeciwników do spasowania.",
      icon: "🎯"
    },
    {
      title: "Ante",
      description: "Na początku każdego rozdania każdy gracz wpłaca ante (100$) do puli startowej.",
      icon: "💰"
    },
    {
      title: "Etapy gry",
      description: "PreFlop (2 karty własne) → Flop (3 karty wspólne) → Turn (4. karta) → River (5. karta) → Showdown (porównanie układów).",
      icon: "📋"
    },
    {
      title: "Układy kart",
      description: "Od najsłabszego: Wysoka karta, Para, Dwie pary, Trójka, Strit, Kolor, Full, Kareta, Poker, Poker królewski.",
      icon: "🃏"
    }
  ],
  actions: [
    {
      name: "PAS (Fold)",
      description: "Rezygnujesz z rozdania i tracisz wpłacone żetony. Użyj gdy masz słabe karty.",
      icon: "❌"
    },
    {
      name: "CZEKAJ (Check)",
      description: "Przechodzisz dalej bez wpłacania, gdy nikt nie podniósł stawki.",
      icon: "⏸️"
    },
    {
      name: "SPRAWDŹ (Call)",
      description: "Wyrównujesz aktualną stawkę przeciwnika, aby zostać w grze.",
      icon: "✅"
    },
    {
      name: "PODBIJ (Raise)",
      description: "Podnosisz stawkę - musisz podbić co najmniej do aktualnego minimum + 1$. Wpisz kwotę i kliknij PODBIJ.",
      icon: "⬆️"
    },
    {
      name: "ALL-IN",
      description: "Stawiasz wszystkie swoje żetony. Automatyczne gdy podbijasz więcej niż masz.",
      icon: "🔥"
    }
  ],
  tips: [
    "Obserwuj zachowanie przeciwników - częste podbijanie może oznaczać silną rękę.",
    "Nie bój się pasować przy słabych kartach - oszczędność żetonów to też strategia.",
    "Pozycja ma znaczenie - grając jako ostatni masz więcej informacji.",
    "Zarządzaj swoim bankrollem - nie ryzykuj wszystkiego na jedną rękę."
  ]
};

export const POKER_MULTIPLAYER_HELP: GameHelpContent = {
  title: "Poker Multiplayer",
  shortDescription: "Graj z prawdziwymi graczami przy wirtualnym stole. Wybierz stół odpowiedni do swojego bankrollu.",
  rules: [
    {
      title: "Cel gry",
      description: "Wygraj pulę mając najlepszy układ kart lub zmuszając wszystkich przeciwników do spasowania.",
      icon: "🎯"
    },
    {
      title: "Ante (wejście)",
      description: "Na początku każdego rozdania każdy gracz wpłaca ante (100$) do puli startowej.",
      icon: "💰"
    },
    {
      title: "Etapy gry",
      description: "PreFlop (2 karty własne) → Flop (3 karty wspólne) → Turn (4. karta) → River (5. karta) → Showdown.",
      icon: "📋"
    },
    {
      title: "Dołączanie do stołu",
      description: "Wybierz stół z lobby. Beginners (100$), High Rollers (1000$), VIP Room (5000$) - to minimalne wejścia.",
      icon: "🚪"
    },
    {
      title: "Rozpoczęcie gry",
      description: "Gdy przy stole jest min. 2 graczy, kliknij 'ROZDAJ KARTY' aby rozpocząć rundę.",
      icon: "▶️"
    },
    {
      title: "Brak żetonów",
      description: "⚠️ Jeśli masz 0 żetonów, gra automatycznie spasuje za Ciebie! Pilnuj swojego bankrollu.",
      icon: "⚠️"
    },
    {
      title: "Układy kart",
      description: "Od najsłabszego: Wysoka karta, Para, Dwie pary, Trójka, Strit, Kolor, Full, Kareta, Poker, Poker królewski.",
      icon: "🃏"
    }
  ],
  actions: [
    {
      name: "PAS (Fold)",
      description: "Rezygnujesz z rozdania i tracisz wpłacone żetony. Użyj gdy masz słabe karty.",
      icon: "❌"
    },
    {
      name: "CZEKAJ (Check)",
      description: "Przechodzisz dalej bez wpłacania, gdy nikt nie podniósł stawki (CurrentMinBet = 0).",
      icon: "⏸️"
    },
    {
      name: "SPRAWDŹ (Call)",
      description: "Wyrównujesz aktualną stawkę przeciwnika, aby zostać w grze. Kwota do wyrównania pokazana na przycisku.",
      icon: "✅"
    },
    {
      name: "PODBIJ (Raise)",
      description: "Podnosisz stawkę - wpisz kwotę i kliknij PODBIJ. Minimalne podbicie: wyrównanie + 1$. Nie możesz podbić o mniej!",
      icon: "⬆️"
    },
    {
      name: "ALL-IN",
      description: "Stawiasz wszystkie swoje żetony. Automatyczne gdy podbijasz więcej niż masz.",
      icon: "🔥"
    },
    {
      name: "CZAT",
      description: "Pisz wiadomości do innych graczy przy stole. Panel czatu znajduje się po lewej stronie.",
      icon: "💬"
    }
  ],
  tips: [
    "⚠️ Przy 0 żetonów gra automatycznie spasuje - doładuj konto przed grą!",
    "Minimalne podbicie musi wyrównać stawkę przeciwnika + co najmniej 1$ więcej.",
    "Obserwuj zachowanie przeciwników - częste podbijanie może oznaczać silną rękę.",
    "Nie bój się pasować przy słabych kartach - oszczędność żetonów to też strategia.",
    "Pozycja ma znaczenie - grając jako ostatni masz więcej informacji."
  ]
};

export const BLACKJACK_HELP: GameHelpContent = {
  title: "Blackjack (Oczko)",
  shortDescription: "Klasyczna gra karciana. Zbierz karty o wartości jak najbliższej 21, ale nie przekrocz tej liczby!",
  rules: [
    {
      title: "Cel gry",
      description: "Pokonaj krupiera mając więcej punktów (max 21). Przekroczenie 21 = przegrana.",
      icon: "🎯"
    },
    {
      title: "Wartości kart",
      description: "2-10 = wartość nominalna, J/Q/K = 10 punktów, As = 1 lub 11 punktów.",
      icon: "🃏"
    },
    {
      title: "Blackjack",
      description: "As + Figura/10 = 21 punktów (Blackjack!) - wypłata 3:2.",
      icon: "⭐"
    },
    {
      title: "Krupier",
      description: "Krupier musi dobierać do 16 i stać na 17+.",
      icon: "🎩"
    }
  ],
  actions: [
    {
      name: "DOBIERZ (Hit)",
      description: "Dobierz kolejną kartę. Ryzykujesz przekroczenie 21!",
      icon: "➕"
    },
    {
      name: "STÓJ (Stand)",
      description: "Zatrzymaj obecną sumę i pozwól krupierowi grać.",
      icon: "✋"
    },
    {
      name: "PODWÓJ (Double)",
      description: "Podwój zakład i dobierz dokładnie jedną kartę (dostępne tylko na początku).",
      icon: "✖️2"
    },
    {
      name: "POSTAW (Bet)",
      description: "Ustaw wysokość zakładu przed rozdaniem kart.",
      icon: "💵"
    }
  ],
  tips: [
    "Przy sumie 11 zawsze podwajaj (jeśli możesz).",
    "Stój przy 17+ - ryzyko przekroczenia 21 jest zbyt wysokie.",
    "Dobieraj przy sumie 11 lub mniej - nie możesz przegrać.",
    "Obserwuj odkrytą kartę krupiera - jeśli ma 6 lub mniej, częściej przekroczy 21."
  ]
};

export const BLACKJACK_MULTIPLAYER_HELP: GameHelpContent = {
  title: "Blackjack Multiplayer",
  shortDescription: "Graj z innymi graczami przy wspólnym stole. Każdy gra przeciwko krupierowi.",
  rules: [
    {
      title: "Cel gry",
      description: "Pokonaj krupiera mając więcej punktów (max 21). Przekroczenie 21 = przegrana.",
      icon: "🎯"
    },
    {
      title: "Wartości kart",
      description: "2-10 = wartość nominalna, J/Q/K = 10 punktów, As = 1 lub 11 punktów.",
      icon: "🃏"
    },
    {
      title: "Blackjack",
      description: "As + Figura/10 = 21 punktów (Blackjack!) - wypłata 3:2.",
      icon: "⭐"
    },
    {
      title: "Krupier",
      description: "Krupier musi dobierać do 16 i stać na 17+.",
      icon: "🎩"
    },
    {
      title: "Wielu graczy",
      description: "Każdy gracz gra niezależnie przeciwko krupierowi. Możesz wygrać nawet gdy inni przegrają.",
      icon: "👥"
    },
    {
      title: "Brak żetonów",
      description: "⚠️ Jeśli masz 0 żetonów, nie możesz postawić zakładu! Doładuj konto przed grą.",
      icon: "⚠️"
    },
    {
      title: "Fazy rundy",
      description: "1. Obstawianie → 2. Rozdanie kart → 3. Decyzje graczy (Hit/Stand/Double) → 4. Ruch krupiera → 5. Wyniki",
      icon: "📋"
    }
  ],
  actions: [
    {
      name: "POSTAW ZAKŁAD",
      description: "Wpisz kwotę i kliknij 'POSTAW'. Musisz postawić przed rozpoczęciem rundy!",
      icon: "💵"
    },
    {
      name: "DOBIERZ (Hit)",
      description: "Dobierz kolejną kartę. Ryzykujesz przekroczenie 21 (bust)!",
      icon: "➕"
    },
    {
      name: "STÓJ (Stand)",
      description: "Zatrzymaj obecną sumę punktów i pozwól krupierowi grać.",
      icon: "✋"
    },
    {
      name: "PODWÓJ (Double)",
      description: "Podwój zakład i dobierz dokładnie jedną kartę (dostępne tylko na początku z 2 kartami).",
      icon: "✖️2"
    },
    {
      name: "CZAT",
      description: "Pisz wiadomości do innych graczy przy stole. Panel czatu znajduje się po lewej stronie.",
      icon: "💬"
    }
  ],
  tips: [
    "⚠️ Przy 0 żetonów nie możesz grać - doładuj konto!",
    "Przy sumie 11 zawsze podwajaj (jeśli możesz).",
    "Stój przy 17+ - ryzyko przekroczenia 21 jest zbyt wysokie.",
    "Dobieraj przy sumie 11 lub mniej - nie możesz przegrać.",
    "Obserwuj odkrytą kartę krupiera - jeśli ma 6 lub mniej, częściej przekroczy 21."
  ]
};

export const ROULETTE_HELP: GameHelpContent = {
  title: "Ruletka",
  shortDescription: "Klasyczna gra kasynowa - postaw na numer, kolor lub zakres i czekaj na wynik!",
  rules: [
    {
      title: "Cel gry",
      description: "Przewiduj, na którym numerze zatrzyma się kulka. Wygrana zależy od typu zakładu.",
      icon: "🎯"
    },
    {
      title: "Numery",
      description: "Ruletka europejska ma numery 0-36. Zero jest zielone, reszta to czerwone i czarne.",
      icon: "🔢"
    },
    {
      title: "Wypłaty",
      description: "Numer: 35:1 | Kolor: 1:1 | Parzyste/Nieparzyste: 1:1 | Połowa (1-18/19-36): 1:1",
      icon: "💰"
    }
  ],
  actions: [
    {
      name: "Wybierz żeton",
      description: "Kliknij na żeton (10, 50, 100 lub 500) aby wybrać wartość zakładu.",
      icon: "🪙"
    },
    {
      name: "Postaw zakład",
      description: "Kliknij na stole w miejsce gdzie chcesz postawić - numer, kolor, parzyste itp.",
      icon: "📍"
    },
    {
      name: "SPIN",
      description: "Zakręć kołem ruletki i czekaj na wynik!",
      icon: "🎰"
    },
    {
      name: "Wyczyść zakłady",
      description: "Usuń wszystkie postawione zakłady przed spinem.",
      icon: "🗑️"
    }
  ],
  tips: [
    "Zakłady zewnętrzne (kolor, parzyste) mają większą szansę wygranej, ale mniejszą wypłatę.",
    "Możesz postawić wiele zakładów naraz - strategia pokrycia wielu numerów.",
    "Zero daje przewagę kasynu - unikaj zakładów tylko na zero.",
    "Ustal limit zakładów i trzymaj się go!"
  ]
};

export const SLOTS_HELP: GameHelpContent = {
  title: "Automaty (Slots)",
  shortDescription: "Klasyczne jednorękie bandyty - pociągnij za dźwignię i wygraj!",
  rules: [
    {
      title: "Cel gry",
      description: "Ułóż 3 takie same symbole w linii, aby wygrać. Różne symbole dają różne mnożniki.",
      icon: "🎯"
    },
    {
      title: "Symbole",
      description: "🍋 Cytryna (2x) | 🍒 Wiśnie (3x) | 🍇 Winogrona (5x) | 🔔 Dzwonek (10x) | ☘️ Koniczyna (15x) | 7️⃣ Siódemka (25x) | 💎 Diament (50x)",
      icon: "🎰"
    },
    {
      title: "Linie wygrywające",
      description: "Wygrana następuje gdy 3 takie same symbole pojawią się w środkowym rzędzie.",
      icon: "➡️"
    }
  ],
  actions: [
    {
      name: "Ustaw zakład",
      description: "Użyj przycisków - i + lub wpisz kwotę zakładu.",
      icon: "💵"
    },
    {
      name: "POCIĄGNIJ / SPIN",
      description: "Kliknij dźwignię lub przycisk SPIN aby zakręcić bębnami.",
      icon: "🎰"
    }
  ],
  tips: [
    "Diamenty dają najwyższą wygraną (50x), ale są najrzadsze.",
    "Siódemki to drugi najlepszy symbol (25x stawki).",
    "Graj rozsądnie - automaty są losowe, nie ma \"gorących\" maszyn.",
    "Ustaw limit strat przed rozpoczęciem gry."
  ]
};

export const GameHelpModal: React.FC<GameHelpModalProps> = ({ content, position = 'floating' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getButtonText = () => {
    if (position === 'header') return <span>Pomoc</span>;
    if (position === 'prominent') return <span>Jak grać?</span>;
    return null;
  };

  return (
    <>
      <button 
        className={`game-help-btn ${position}`} 
        onClick={() => setIsOpen(true)}
        title="Jak grać?"
      >
        <i className="fas fa-question-circle"></i>
        {getButtonText()}
      </button>

      {isOpen && (
        <div className="game-help-overlay" onClick={() => setIsOpen(false)}>
          <div className="game-help-modal" onClick={e => e.stopPropagation()}>
            <button className="game-help-close" onClick={() => setIsOpen(false)}>
              <i className="fas fa-times"></i>
            </button>

            <div className="game-help-header">
              <h2>{content.title}</h2>
              <p className="game-help-short">{content.shortDescription}</p>
            </div>

            <div className="game-help-content">
              <section className="game-help-section">
                <h3><i className="fas fa-book"></i> Zasady gry</h3>
                <div className="game-help-rules">
                  {content.rules.map((rule, i) => (
                    <div key={i} className="game-help-rule">
                      <span className="rule-icon">{rule.icon}</span>
                      <div>
                        <strong>{rule.title}</strong>
                        <p>{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="game-help-section">
                <h3><i className="fas fa-gamepad"></i> Dostępne akcje</h3>
                <div className="game-help-actions">
                  {content.actions.map((action, i) => (
                    <div key={i} className="game-help-action">
                      <span className="action-icon">{action.icon}</span>
                      <div>
                        <strong>{action.name}</strong>
                        <p>{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {content.tips && content.tips.length > 0 && (
                <section className="game-help-section">
                  <h3><i className="fas fa-lightbulb"></i> Porady</h3>
                  <ul className="game-help-tips">
                    {content.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameHelpModal;
