// Ten komponent został zamieniony na helpOverlay.js (nakładkę JavaScript)
// System pomocy jest teraz obsługiwany przez global helpOverlay.js załadowany w index.html
// Ikonka pomocy znajduje się w prawym dolnym rogu na każdej stronie

// Eksporty dla kompatybilności z istniejącym kodem
export const GameHelpModal = () => null;

export interface GameHelpContent {
  title: string;
  shortDescription: string;
  rules: any[];
  actions: any[];
  tips?: string[];
}

// Puste obiekty dla kompatybilności
export const POKER_HELP: GameHelpContent = { 
  title: '', 
  shortDescription: '', 
  rules: [], 
  actions: [] 
};

export const POKER_MULTIPLAYER_HELP: GameHelpContent = { 
  title: '', 
  shortDescription: '', 
  rules: [], 
  actions: [] 
};

export const BLACKJACK_HELP: GameHelpContent = { 
  title: '', 
  shortDescription: '', 
  rules: [], 
  actions: [] 
};

export const BLACKJACK_MULTIPLAYER_HELP: GameHelpContent = { 
  title: '', 
  shortDescription: '', 
  rules: [], 
  actions: [] 
};

export const ROULETTE_HELP: GameHelpContent = { 
  title: '', 
  shortDescription: '', 
  rules: [], 
  actions: [] 
};

export const SLOTS_HELP: GameHelpContent = { 
  title: '', 
  shortDescription: '', 
  rules: [], 
  actions: [] 
};

export default GameHelpModal;
