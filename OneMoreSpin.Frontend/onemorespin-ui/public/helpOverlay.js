// Help Overlay System - Optimized Version
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        gamePages: ['blackjack', 'poker', 'roulette', 'slots'],
        animationDuration: 300,
        shinyDelay: 800
    };
    
    // Get current language
    const getLang = () => localStorage.getItem('language') || 'pl';
    
    // Get translations
    const getTranslations = () => {
        const t = window.__HELP_TRANSLATIONS__;
        return t ? t[getLang()] : null;
    };
    
    // Check if on game page
    const isGamePage = () => CONFIG.gamePages.some(g => location.pathname.includes(g));
    
    // Create help button
    function createHelpButton() {
        if (document.getElementById('help-btn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'help-btn';
        btn.className = 'help-btn';
        btn.innerHTML = '?';
        btn.title = getLang() === 'pl' ? 'Pomoc' : 'Help';
        btn.onclick = openOverlay;
        document.body.appendChild(btn);
        
        setTimeout(() => btn.classList.add('help-btn-shine'), CONFIG.shinyDelay);
    }
    
    // Update button visibility
    function updateVisibility() {
        const btn = document.getElementById('help-btn');
        if (isGamePage()) {
            if (!btn) createHelpButton();
            else btn.style.display = 'flex';
        } else if (btn) {
            btn.style.display = 'none';
        }
    }
    
    // Get help content for current page
    function getHelpContent(t) {
        const url = location.pathname;
        
        // Blackjack Multiplayer
        if (url.includes('blackjack-multi')) {
            const h = t.blackjackMultiplayer;
            return { 
                title: h.title,
                sections: [
                    { title: h.goal.title, content: h.goal.desc },
                    { title: h.betting.title, content: h.betting.desc },
                    { title: h.gameplay.title, content: h.gameplay.desc },
                    { title: h.chat.title, content: h.chat.desc },
                    { title: h.tips.title, content: h.tips.desc }
                ]
            };
        }
        
        // Blackjack Solo
        if (url.includes('blackjack')) {
            const h = t.blackjack;
            return {
                title: h.title,
                sections: [
                    { title: h.goal.title, content: h.goal.desc },
                    { title: h.cards.title, content: h.cards.desc },
                    { title: h.actions.title, content: h.actions.desc },
                    { title: h.rules.title, content: h.rules.desc },
                    { title: h.tips.title, content: h.tips.desc }
                ]
            };
        }
        
        // Poker Multiplayer (lobby/table)
        if (url.includes('poker/') || url.includes('poker-lobby') || url.includes('poker-mode')) {
            const h = t.pokerMultiplayer;
            return {
                title: h.title,
                sections: [
                    { title: h.goal.title, content: h.goal.desc },
                    { title: h.ante.title, content: h.ante.desc },
                    { title: h.phases.title, content: h.phases.desc },
                    { title: h.actions.title, content: h.actions.desc },
                    { title: h.tips.title, content: h.tips.desc }
                ]
            };
        }
        
        // Video Poker
        if (url.includes('single-poker')) {
            const h = t.poker;
            return {
                title: h.title,
                sections: [
                    { title: h.goal.title, content: h.goal.desc },
                    { title: h.hands.title, content: h.hands.desc },
                    { title: h.gameplay.title, content: h.gameplay.desc },
                    { title: h.payouts.title, content: h.payouts.desc },
                    { title: h.tips.title, content: h.tips.desc }
                ]
            };
        }
        
        // Roulette
        if (url.includes('roulette')) {
            const h = t.roulette;
            return {
                title: h.title,
                sections: [
                    { title: h.goal.title, content: h.goal.desc },
                    { title: h.numbers.title, content: h.numbers.desc },
                    { title: h.bets.title, content: h.bets.desc },
                    { title: h.gameplay.title, content: h.gameplay.desc },
                    { title: h.tips.title, content: h.tips.desc }
                ]
            };
        }
        
        // Slots
        if (url.includes('slots')) {
            const h = t.slots;
            return {
                title: h.title,
                sections: [
                    { title: h.goal.title, content: h.goal.desc },
                    { title: h.symbols.title, content: h.symbols.desc },
                    { title: h.gameplay.title, content: h.gameplay.desc },
                    { title: h.rules.title, content: h.rules.desc },
                    { title: h.tips.title, content: h.tips.desc }
                ]
            };
        }
        
        return null;
    }
    
    // Open overlay
    function openOverlay() {
        if (document.getElementById('help-overlay')) return;
        
        const t = getTranslations();
        if (!t) {
            console.warn('Help translations not loaded');
            return;
        }
        
        const help = getHelpContent(t);
        if (!help) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'help-overlay';
        overlay.className = 'help-overlay';
        
        overlay.innerHTML = `
            <div class="help-modal">
                <button class="help-close" onclick="window.__closeHelpOverlay__()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="help-header">
                    <h2>${help.title}</h2>
                </div>
                <div class="help-grid">
                    ${help.sections.map(s => `
                        <div class="help-card">
                            <h3>${s.title}</h3>
                            <div class="help-card-content">${s.content}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeOverlay();
        });
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        requestAnimationFrame(() => overlay.classList.add('help-overlay-show'));
    }
    
    // Close overlay
    function closeOverlay() {
        const overlay = document.getElementById('help-overlay');
        if (!overlay) return;
        
        overlay.classList.remove('help-overlay-show');
        overlay.classList.add('help-overlay-hide');
        
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, CONFIG.animationDuration);
    }
    
    // Global close function
    window.__closeHelpOverlay__ = closeOverlay;
    
    // Inject styles
    function injectStyles() {
        if (document.getElementById('help-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'help-styles';
        style.textContent = `
            /* Help Button */
            .help-btn {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(145deg, #6366f1, #8b5cf6);
                border: none;
                color: white;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5),
                            0 0 40px rgba(139, 92, 246, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .help-btn:hover {
                transform: scale(1.1) translateY(-2px);
                box-shadow: 0 8px 30px rgba(99, 102, 241, 0.6),
                            0 0 60px rgba(139, 92, 246, 0.3);
            }
            
            .help-btn:active {
                transform: scale(0.95);
            }
            
            @keyframes shine {
                0%, 100% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(139, 92, 246, 0.2); }
                50% { box-shadow: 0 4px 30px rgba(99, 102, 241, 0.8), 0 0 60px rgba(139, 92, 246, 0.5); }
            }
            
            .help-btn-shine {
                animation: shine 2s ease-in-out infinite;
            }
            
            /* Overlay */
            .help-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .help-overlay-show {
                opacity: 1;
            }
            
            .help-overlay-hide {
                opacity: 0;
            }
            
            /* Modal */
            .help-modal {
                background: linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 24px;
                max-width: 1100px;
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5),
                            0 0 100px rgba(139, 92, 246, 0.15);
                position: relative;
            }
            
            /* Close Button */
            .help-close {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 40px;
                height: 40px;
                background: rgba(239, 68, 68, 0.2);
                border: 2px solid rgba(239, 68, 68, 0.5);
                border-radius: 50%;
                color: #ef4444;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 10;
            }
            
            .help-close:hover {
                background: rgba(239, 68, 68, 0.4);
                transform: rotate(90deg);
            }
            
            /* Header */
            .help-header {
                padding: 28px 32px 20px;
                border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                text-align: center;
            }
            
            .help-header h2 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                background: linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            /* Grid */
            .help-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
                padding: 24px;
                overflow-y: auto;
                max-height: calc(90vh - 100px);
            }
            
            /* Cards */
            .help-card {
                background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 16px;
                padding: 20px;
                transition: all 0.3s ease;
            }
            
            .help-card:hover {
                border-color: rgba(139, 92, 246, 0.4);
                background: linear-gradient(145deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.08));
                transform: translateY(-2px);
            }
            
            .help-card h3 {
                margin: 0 0 14px 0;
                color: #a78bfa;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .help-card-content {
                color: rgba(255, 255, 255, 0.85);
                font-size: 14px;
                line-height: 1.7;
            }
            
            .help-card-content strong {
                color: #fbbf24;
                font-weight: 600;
            }
            
            /* Scrollbar */
            .help-grid::-webkit-scrollbar {
                width: 6px;
            }
            
            .help-grid::-webkit-scrollbar-track {
                background: rgba(139, 92, 246, 0.1);
                border-radius: 3px;
            }
            
            .help-grid::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.4);
                border-radius: 3px;
            }
            
            .help-grid::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.6);
            }
            
            /* Mobile */
            @media (max-width: 640px) {
                .help-btn {
                    width: 48px;
                    height: 48px;
                    font-size: 20px;
                    bottom: 16px;
                    right: 16px;
                }
                
                .help-modal {
                    border-radius: 16px;
                    max-height: 95vh;
                }
                
                .help-header {
                    padding: 20px 24px 16px;
                }
                
                .help-header h2 {
                    font-size: 22px;
                }
                
                .help-grid {
                    grid-template-columns: 1fr;
                    padding: 16px;
                    gap: 12px;
                }
                
                .help-card {
                    padding: 16px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize
    function init() {
        injectStyles();
        updateVisibility();
        
        // Watch for route changes (SPA)
        const watchRoutes = () => {
            let lastPath = location.pathname;
            
            const check = () => {
                if (location.pathname !== lastPath) {
                    lastPath = location.pathname;
                    updateVisibility();
                }
            };
            
            // Override history methods
            const wrap = (method) => {
                const orig = history[method];
                history[method] = function() {
                    const result = orig.apply(this, arguments);
                    check();
                    return result;
                };
            };
            
            wrap('pushState');
            wrap('replaceState');
            window.addEventListener('popstate', check);
            
            // Also use MutationObserver as backup
            const observer = new MutationObserver(check);
            observer.observe(document.body, { childList: true, subtree: true });
        };
        
        watchRoutes();
    }
    
    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
