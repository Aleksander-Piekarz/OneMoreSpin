import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
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

// Predefiniowane treści pomocy dla różnych gier - zawierają KLUCZE z LanguageContext zamiast tekstów
export const POKER_HELP: GameHelpContent = {
  title: "help.pokerTitle",
  shortDescription: "help.pokerDesc",
  rules: [
    {
      title: "help.goalOfGame",
      description: "help.winPot",
      icon: "🎯"
    },
    {
      title: "help.ante",
      description: "help.anteDesc",
      icon: "💰"
    },
    {
      title: "help.gameStages",
      description: "help.stagesDesc",
      icon: "📋"
    },
    {
      title: "help.cardHands",
      description: "help.handsDesc",
      icon: "🃏"
    }
  ],
  actions: [
    {
      name: "help.fold",
      description: "help.foldDesc",
      icon: "❌"
    },
    {
      name: "help.check",
      description: "help.checkDesc",
      icon: "⏸️"
    },
    {
      name: "help.call",
      description: "help.callDesc",
      icon: "✅"
    },
    {
      name: "help.raise",
      description: "help.raiseDesc",
      icon: "⬆️"
    },
    {
      name: "help.allIn",
      description: "help.allInDesc",
      icon: "🔥"
    }
  ],
  tips: [
    "help.observeOpponents",
    "help.dontFearFold",
    "help.positionMatters",
    "help.manageBankroll"
  ]
};

export const POKER_MULTIPLAYER_HELP: GameHelpContent = {
  title: "help.pokerTitle",
  shortDescription: "help.pokerDesc",
  rules: [
    {
      title: "help.goalOfGame",
      description: "help.winPot",
      icon: "🎯"
    },
    {
      title: "help.ante",
      description: "help.anteDesc",
      icon: "💰"
    },
    {
      title: "help.gameStages",
      description: "help.stagesDesc",
      icon: "📋"
    },
    {
      title: "help.cardHands",
      description: "help.handsDesc",
      icon: "🃏"
    }
  ],
  actions: [
    {
      name: "help.fold",
      description: "help.foldDesc",
      icon: "❌"
    },
    {
      name: "help.check",
      description: "help.checkDesc",
      icon: "⏸️"
    },
    {
      name: "help.call",
      description: "help.callDesc",
      icon: "✅"
    },
    {
      name: "help.raise",
      description: "help.raiseDesc",
      icon: "⬆️"
    },
    {
      name: "help.allIn",
      description: "help.allInDesc",
      icon: "🔥"
    }
  ],
  tips: [
    "help.observeOpponents",
    "help.dontFearFold",
    "help.positionMatters",
    "help.manageBankroll"
  ]
};

export const BLACKJACK_HELP: GameHelpContent = {
  title: "help.blackjackTitle",
  shortDescription: "help.blackjackDesc",
  rules: [
    {
      title: "help.beatDealer",
      description: "help.beatDealer",
      icon: "🎯"
    },
    {
      title: "help.cardValues",
      description: "help.valuesDesc",
      icon: "🃏"
    },
    {
      title: "help.blackjack",
      description: "help.blackjackDesc",
      icon: "⭐"
    },
    {
      title: "help.dealer",
      description: "help.dealerDesc",
      icon: "🎩"
    }
  ],
  actions: [
    {
      name: "help.hit",
      description: "help.hitDesc",
      icon: "➕"
    },
    {
      name: "help.stand",
      description: "help.standDesc",
      icon: "✋"
    },
    {
      name: "help.double",
      description: "help.doubleDesc",
      icon: "✖️2"
    },
    {
      name: "help.placeBet",
      description: "help.placeBetDesc",
      icon: "💵"
    }
  ],
  tips: [
    "help.alwaysDouble11",
    "help.standAt17",
    "help.hitAt11Less",
    "help.watchDealerCard"
  ]
};

export const BLACKJACK_MULTIPLAYER_HELP: GameHelpContent = {
  title: "help.blackjackTitle",
  shortDescription: "help.blackjackDesc",
  rules: [
    {
      title: "help.beatDealer",
      description: "help.beatDealer",
      icon: "🎯"
    },
    {
      title: "help.cardValues",
      description: "help.valuesDesc",
      icon: "🃏"
    },
    {
      title: "help.blackjack",
      description: "help.blackjackDesc",
      icon: "⭐"
    },
    {
      title: "help.dealer",
      description: "help.dealerDesc",
      icon: "🎩"
    }
  ],
  actions: [
    {
      name: "help.placeBet",
      description: "help.placeBetDesc",
      icon: "💵"
    },
    {
      name: "help.hit",
      description: "help.hitDesc",
      icon: "➕"
    },
    {
      name: "help.stand",
      description: "help.standDesc",
      icon: "✋"
    },
    {
      name: "help.double",
      description: "help.doubleDesc",
      icon: "✖️2"
    }]
};

export const ROULETTE_HELP: GameHelpContent = {
  title: "help.rouletteTitle",
  shortDescription: "help.rouletteDesc",
  rules: [
    {
      title: "help.predictNumber",
      description: "help.predictNumber",
      icon: "🎯"
    },
    {
      title: "help.numbers",
      description: "help.numbersDesc",
      icon: "🔢"
    },
    {
      title: "help.payouts",
      description: "help.payoutsDesc",
      icon: "💰"
    }
  ],
  actions: [
    {
      name: "help.selectChip",
      description: "help.selectChipDesc",
      icon: "🪙"
    },
    {
      name: "help.placeBetRoulette",
      description: "help.placeBetRouletteDesc",
      icon: "📍"
    },
    {
      name: "help.spin",
      description: "help.spinDesc",
      icon: "🎰"
    },
    {
      name: "help.clearBets",
      description: "help.clearBetsDesc",
      icon: "🗑️"
    }
  ],
  tips: [
    "help.outsideBets",
    "help.multipleBeats",
    "help.zeroHouseEdge",
    "help.setBettingLimit"
  ]
};

export const SLOTS_HELP: GameHelpContent = {
  title: "help.slotsTitle",
  shortDescription: "help.slotsDesc",
  rules: [
    {
      title: "help.lineUpSymbols",
      description: "help.lineUpSymbols",
      icon: "🎯"
    },
    {
      title: "help.symbols",
      description: "help.symbolsDesc",
      icon: "🎰"
    },
    {
      title: "help.winningLines",
      description: "help.winningLinesDesc",
      icon: "➡️"
    }
  ],
  actions: [
    {
      name: "help.setBet",
      description: "help.setBetDesc",
      icon: "💵"
    },
    {
      name: "help.pull",
      description: "help.pullDesc",
      icon: "🎰"
    }
  ],
  tips: [
    "help.diamondsHighest",
    "help.sevensSecond",
    "help.playResponsibly",
    "help.setLossLimit"
  ]
};

export const GameHelpModal: React.FC<GameHelpModalProps> = ({ content, position = 'floating' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, t } = useLanguage();

  // Tłumacz tekst - jeśli to klucz (zaczyna się od "help."), użyj t(), inaczej zwróć tekst
  const translateText = (text: string): string => {
    if (text.startsWith('help.')) {
      return t(text);
    }
    return text;
  };

  const translatedContent = {
    ...content,
    title: translateText(content.title),
    shortDescription: translateText(content.shortDescription),
    rules: content.rules.map(rule => ({
      ...rule,
      title: translateText(rule.title),
      description: translateText(rule.description)
    })),
    actions: content.actions.map(action => ({
      ...action,
      name: translateText(action.name),
      description: translateText(action.description)
    })),
    tips: content.tips?.map(tip => translateText(tip)) || []
  };

  const getButtonText = () => {
    if (position === 'header') return <span>{t('help.help')}</span>;
    if (position === 'prominent') return <span>{t('help.howToPlay')}</span>;
    return null;
  };

  return (
    <>
      <button 
        className={`game-help-btn ${position}`} 
        onClick={() => setIsOpen(true)}
        title={t('help.howToPlay')}
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
              <h2>{translatedContent.title}</h2>
              <p className="game-help-short">{translatedContent.shortDescription}</p>
            </div>

            <div className="game-help-content">
              <section className="game-help-section">
                <h3><i className="fas fa-book"></i> {t('help.rules')}</h3>
                <div className="game-help-rules">
                  {translatedContent.rules.map((rule, i) => (
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
                <h3><i className="fas fa-gamepad"></i> {t('help.actions')}</h3>
                <div className="game-help-actions">
                  {translatedContent.actions.map((action, i) => (
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

              {translatedContent.tips && translatedContent.tips.length > 0 && (
                <section className="game-help-section">
                  <h3><i className="fas fa-lightbulb"></i> {t('help.tips')}</h3>
                  <ul className="game-help-tips">
                    {translatedContent.tips.map((tip, i) => (
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
