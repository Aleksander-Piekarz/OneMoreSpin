export const GameHelpModal = () => null;

export interface GameHelpContent {
  title: string;
  shortDescription: string;
  rules: any[];
  actions: any[];
  tips?: string[];
}

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
