import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import '../styles/UserPage.css';

// Ikony
const UserIcon = () => <span className="userpage-card-header-icon">👤</span>;
const WalletIcon = () => <span className="userpage-card-header-icon">💰</span>;
const HistoryIcon = () => <span className="userpage-card-header-icon">📜</span>;
const SecurityIcon = () => <span className="userpage-card-header-icon">🔒</span>;

// Typy
type MeUser = {
    id: number;
    email: string;
    name: string;
    surname: string;
    isVip: boolean;
    balance: number;
};

type PaymentHistoryItem = {
    id: number;
    amount: number;
    createdAt: string;
    transactionType: string;
};

type GameHistoryItemVm = {
    gameName: string;
    outcome: string;
    dateOfGame: string;
    stake: number;
    moneyWon: number;
};

interface CardHeaderProps {
    icon: React.ReactNode;
    title: string;
}
const CardHeader = ({ icon, title }: CardHeaderProps) => (
    <div className="userpage-card-header">
        {icon}
        <span className="userpage-card-header-title">{title}</span>
    </div>
);

function UserProfile() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams(); 
    
    const [me, setMe] = useState<MeUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'transakcje' | 'gry'>('transakcje');
    const [toast, setToast] = useState<string>("");

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState(100);
    const [depositError, setDepositError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState(50);
    const [withdrawalError, setWithdrawalError] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const [transactions, setTransactions] = useState<PaymentHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const [games, setGames] = useState<GameHistoryItemVm[]>([]);
    const [gameHistoryLoading, setGameHistoryLoading] = useState(true);
    const [gameHistoryError, setGameHistoryError] = useState<string | null>(null);
    
    // --- EFEKTY ---

    // 1. Pobieranie danych użytkownika
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            navigate('/');
            return;
        }
        (async () => {
            try {
                const user = await api.auth.me();
                setMe(user as MeUser);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    // 2. Obsługa powrotu ze Stripe
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');

        const handleStatus = async (status: string) => {
            if (status === 'success') {
                setToast('Płatność udana! Odświeżanie salda...');
                try {
                    const user = await api.auth.me();
                    setMe(user as MeUser);
                    setToast('Saldo zaktualizowane!');
                } catch (e) {
                    setToast('Płatność udana, ale nie udało się odświeżyć salda.');
                } finally {
                    setTimeout(() => setToast(""), 10000);
                }
            } else if (status === 'cancel') {
                setToast('Płatność została anulowana.');
                setTimeout(() => setToast(""), 10000);
            }

            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('payment');
            setSearchParams(newSearchParams, { replace: true });
        };

        if (paymentStatus) {
            handleStatus(paymentStatus);
        }
        
    }, [searchParams, setSearchParams]);

    // 3. Pobieranie danych do zakładek
    useEffect(() => {
        if (activeTab === 'transakcje') {
            setHistoryLoading(true);
            setHistoryError(null);
            api.payment.getHistory()
                .then(data => setTransactions(data))
                .catch(err => setHistoryError(err instanceof Error ? err.message : 'Nie udało się pobrać historii transakcji'))
                .finally(() => setHistoryLoading(false));
        }
        
        if (activeTab === 'gry') {
            setGameHistoryLoading(true);
            setGameHistoryError(null);
            api.game.getHistory()
                .then(data => setGames(data))
                .catch(err => setGameHistoryError(err instanceof Error ? err.message : 'Nie udało się pobrać historii gier'))
                .finally(() => setGameHistoryLoading(false));
        }
    }, [activeTab]);

    const displayName = useMemo(() => {
        if (!me) return '';
        const full = `${me.name ?? ''} ${me.surname ?? ''}`.trim();
        return (full || me.email?.split('@')[0]) ?? 'User';
    }, [me]);

    const balanceText = useMemo(() => {
        if (!me) return '—';
        try {
            return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(me.balance);
        } catch {
            return `${me.balance.toFixed(2)} PLN`;
        }
    }, [me]);

    const vipText = me?.isVip ? 'VIP' : 'Standard';
    const statusText = 'Aktywne';
    
    if (error) {
        return <div className="userpage-container"><div>Nie udało się pobrać profilu: {error}</div></div>;
    }
    
    // *** POPRAWKA: Wyświetlaj ekran ładowania, dopóki dane nie są gotowe ***
    if (loading || !me) {
        return <div className="userpage-container"><div>Ładowanie...</div></div>;
    }

    return (
        <div className="userpage-container">
            <div className="animated-bg">
                <div className="floating-shape" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', width: 400, height: 400, top: -100, left: -100, position: 'absolute', animationDuration: '25s'}}></div>
                <div className="floating-shape" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', width: 300, height: 300, top: '20%', right: -50, position: 'absolute', animationDuration: '30s', animationDelay: '5s'}}></div>
                <div className="floating-shape" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', width: 350, height: 350, bottom: -100, left: '50%', position: 'absolute', animationDuration: '28s', animationDelay: '10s'}}></div>
                <div className="floating-shape" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', width: 250, height: 250, top: '60%', left: '10%', position: 'absolute', animationDuration: '22s', animationDelay: '15s'}}></div>
                <div className="floating-shape" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', width: 300, height: 300, bottom: '10%', right: '15%', position: 'absolute', animationDuration: '27s', animationDelay: '8s'}}></div>
            </div>
            
            <button className="userpage-back-btn" onClick={() => navigate('/home')}>
                Powrót
            </button>
            
            <header className="userpage-header">
                <h1 className="userpage-title">MÓJ PROFIL</h1>
            </header>
            
            <div className="userpage-content">
                <div className="userpage-grid">
                    <div className="userpage-card">
                        <CardHeader icon={<UserIcon />} title="Dane Gracza" />
                        <ul className="userpage-list">
                            <li className="userpage-list-item">
                                <span className="userpage-label">Nazwa użytkownika:</span>
                                <span className="userpage-value">{displayName}</span>
                            </li>
                            <li className="userpage-list-item">
                                <span className="userpage-label">Adres e-mail:</span>
                                <span className="userpage-value">{me.email}</span>
                            </li>
                            <li className="userpage-list-item">
                                <span className="userpage-label">Status konta:</span>
                                <span className="userpage-status">{statusText}</span>
                            </li>
                            <li className="userpage-list-item">
                                <span className="userpage-label">Status VIP:</span>
                                <span className="userpage-vip">{vipText}</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="userpage-card">
                        <CardHeader icon={<WalletIcon />} title="Mój Portfel" />
                        <div className="userpage-balance-label">Aktualne Saldo</div>
                        <div className="userpage-balance">{balanceText}</div>
                        <div className="userpage-balance-info">+100 Monet za jutrzejsze logowanie!</div>
                        <button className="userpage-btn" onClick={() => setShowDepositModal(true)}>WPŁAĆ</button>
                        <button className="userpage-btn" onClick={() => setShowWithdrawalModal(true)}>WYPŁAĆ</button>
                    </div>
                    
                    <div className="userpage-card" style={{gridColumn: '1 / -1'}}>
                        <CardHeader icon={<HistoryIcon />} title="Historia" />
                        <div className="userpage-tabs">
                            <button 
                                className={`userpage-tab${activeTab==='transakcje'?' active':''}`} 
                                onClick={()=>setActiveTab('transakcje')}
                            >
                                TRANSAKCJE
                            </button>
                            <button 
                                className={`userpage-tab${activeTab==='gry'?' active':''}`} 
                                onClick={()=>setActiveTab('gry')}
                            >
                                GRY
                            </button>
                        </div>
                        <div>
                            {activeTab==='transakcje' && (
                                <table className="userpage-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Typ</th>
                                            <th>Kwota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyLoading ? (
                                            <tr><td colSpan={3} style={{ textAlign: 'center' }}>Ładowanie...</td></tr>
                                        ) : historyError ? (
                                            <tr><td colSpan={3} style={{ textAlign: 'center', color: 'red' }}>{historyError}</td></tr>
                                        ) : transactions.length === 0 ? (
                                            <tr><td colSpan={3} style={{ textAlign: 'center' }}>Brak historii transakcji.</td></tr>
                                        ) : (
                                            transactions.map(tx => (
                                                <tr key={tx.id}>
                                                    <td>{new Date(tx.createdAt).toLocaleString('pl-PL')}</td>
                                                    <td>{tx.transactionType}</td>
                                                    <td style={{ color: tx.amount > 0 ? '#4caf50' : '#f44336' }}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} PLN
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                            {activeTab==='gry' && (
                                <table className="userpage-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Gra</th>
                                            <th>Wynik</th>
                                            <th>Stawka</th>
                                            <th>Wygrana</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gameHistoryLoading ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Ładowanie...</td></tr>
                                        ) : gameHistoryError ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'red' }}>{gameHistoryError}</td></tr>
                                        ) : games.length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Brak historii gier.</td></tr>
                                        ) : (
                                            games.map((game, index) => (
                                                <tr key={index}>
                                                    <td>{new Date(game.dateOfGame).toLocaleString('pl-PL')}</td>
                                                    <td>{game.gameName}</td>
                                                    <td>{game.outcome}</td>
                                                    <td>{game.stake.toFixed(2)} PLN</td>
                                                    <td style={{ color: game.moneyWon > 0 ? '#4caf50' : 'inherit' }}>
                                                        {game.moneyWon.toFixed(2)} PLN
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    
                    <div className="userpage-card" style={{gridColumn: '1 / -1'}}>
                        <CardHeader icon={<SecurityIcon />} title="Bezpieczeństwo" />
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '600px', margin: '0 auto'}}>
                            <button className="userpage-security-btn" onClick={() => setShowPasswordModal(true)}>ZMIEŃ HASŁO</button>
                            <button className="userpage-security-btn delete" onClick={() => setShowDeleteModal(true)}>USUŃ KONTO</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {showDepositModal && (
                <div className="modal-overlay" onClick={() => !isSubmitting && setShowDepositModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Wpłać środki</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setDepositError('');
                            if (depositAmount < 5) {
                                setDepositError('Minimalna kwota wpłaty to 5.00 PLN');
                                return;
                            }
                            setIsSubmitting(true);
                            try {
                                const response = await api.payment.createCheckoutSession(depositAmount);
                                if (response.url) {
                                    window.location.href = response.url;
                                } else {
                                    setDepositError('Nie udało się rozpocząć płatności. Spróbuj ponownie.');
                                }
                            } catch (err) {
                                setDepositError(err instanceof Error ? err.message : 'Wystąpił błąd serwera');
                                setIsSubmitting(false);
                            }
                        }}>
                            <div className="modal-form-group">
                                <label htmlFor="depositAmount">Kwota wpłaty (PLN)</label>
                                <input
                                    type="number"
                                    id="depositAmount"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                                    placeholder="Wpisz kwotę"
                                    min="5"
                                    step="1"
                                    disabled={isSubmitting}
                                />
                            </div>
                            
                            {depositError && (
                                <div className="modal-error">{depositError}</div>
                            )}
                            
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="modal-btn-cancel"
                                    onClick={() => setShowDepositModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Anuluj
                                </button>
                                <button type="submit" className="modal-btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Przetwarzanie...' : 'Przejdź do płatności'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showWithdrawalModal && (
                <div className="modal-overlay" onClick={() => !isWithdrawing && setShowWithdrawalModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Wypłać środki</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setWithdrawalError('');
                            if (withdrawalAmount <= 0) {
                                setWithdrawalError('Kwota wypłaty musi być większa od zera.');
                                return;
                            }
                            if (me && withdrawalAmount > me.balance) {
                                setWithdrawalError('Nie masz wystarczających środków na koncie.');
                                return;
                            }
                            setIsWithdrawing(true);
                            try {
                                const response = await api.payment.createWithdrawal(withdrawalAmount);
                                setMe(prev => prev ? { ...prev, balance: response.newBalance } : null);
                                setToast(`Wypłacono ${withdrawalAmount.toFixed(2)} PLN. Saldo zaktualizowane!`);
                                // Odśwież historię transakcji
                                api.payment.getHistory().then(setTransactions);
                                setTimeout(() => {
                                    setShowWithdrawalModal(false);
                                    setIsWithdrawing(false);
                                    setWithdrawalAmount(50);
                                    setToast('');
                                }, 3000);
                            } catch (err) {
                                setWithdrawalError(err instanceof Error ? err.message : 'Wystąpił błąd serwera');
                                setIsWithdrawing(false);
                            }
                        }}>
                            <div className="modal-form-group">
                                <label htmlFor="withdrawalAmount">Kwota wypłaty (PLN)</label>
                                <input
                                    type="number"
                                    id="withdrawalAmount"
                                    value={withdrawalAmount}
                                    onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                                    placeholder="Wpisz kwotę"
                                    min="1"
                                    step="1"
                                    max={me?.balance ?? 0}
                                    disabled={isWithdrawing}
                                />
                            </div>
                            
                            {withdrawalError && (
                                <div className="modal-error">{withdrawalError}</div>
                            )}
                            
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="modal-btn-cancel"
                                    onClick={() => setShowWithdrawalModal(false)}
                                    disabled={isWithdrawing}
                                >
                                    Anuluj
                                </button>
                                <button type="submit" className="modal-btn-submit" disabled={isWithdrawing}>
                                    {isWithdrawing ? 'Przetwarzanie...' : 'Wypłać'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Zmiana hasła</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setPasswordError('');
                            setPasswordSuccess('');
                            if (!currentPassword || !newPassword || !confirmPassword) {
                                setPasswordError('Wszystkie pola są wymagane'); return;
                            }
                            if (newPassword.length < 6) {
                                setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków'); return;
                            }
                            if (newPassword !== confirmPassword) {
                                setPasswordError('Nowe hasła nie są zgodne'); return;
                            }
                            try {
                                await api.users.changePassword({ currentPassword, newPassword });
                                setPasswordSuccess('Hasło zostało zmienione pomyślnie');
                                setTimeout(() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                                    setPasswordError(''); setPasswordSuccess('');
                                    setToast('Hasło zostało zmienione');
                                    setTimeout(() => setToast(""), 4000);
                                }, 2000);
                            } catch (err) {
                                setPasswordError(err instanceof Error ? err.message : 'Nie udało się zmienić hasła');
                            }
                        }}>
                            <div className="modal-form-group">
                                <label htmlFor="currentPassword">Aktualne hasło</label>
                                <input
                                    type="password" id="currentPassword" value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Wpisz aktualne hasło"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label htmlFor="newPassword">Nowe hasło</label>
                                <input
                                    type="password" id="newPassword" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Wpisz nowe hasło (min. 6 znaków)"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label htmlFor="confirmPassword">Potwierdź nowe hasło</label>
                                <input
                                    type="password" id="confirmPassword" value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Potwierdź nowe hasło"
                                />
                            </div>
                            {passwordError && (<div className="modal-error">{passwordError}</div>)}
                            {passwordSuccess && (<div className="modal-success">{passwordSuccess}</div>)}
                            <div className="modal-buttons">
                                <button type="button" className="modal-btn-cancel"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                                        setPasswordError(''); setPasswordSuccess('');
                                    }}
                                >
                                    Anuluj
                                </button>
                                <button type="submit" className="modal-btn-submit">
                                    Zmień hasło
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Usuń konto</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setDeleteError('');
                            if (!deletePassword) {
                                setDeleteError('Wpisz hasło aby potwierdzić'); return;
                            }
                            try {
                                await api.users.deleteAccount({ password: deletePassword });
                                localStorage.setItem('flash', 'Konto zostało pomyślnie usunięte');
                                localStorage.removeItem('jwt');
                                localStorage.removeItem('user');
                                navigate('/');
                            } catch (err) {
                                const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć konta';
                                if (errorMessage.toLowerCase().includes('invalid password') || errorMessage.toLowerCase().includes('password')) {
                                    setDeleteError('Nieprawidłowe hasło');
                                } else {
                                    setDeleteError(errorMessage);
                                }
                            }
                        }}>
                            <div className="modal-warning">
                                <p className="modal-warning-title">⚠️ Ostrzeżenie!</p>
                                <p className="modal-warning-text">
                                    Ta operacja jest nieodwracalna. Wszystkie Twoje dane, historia gier i saldo zostaną permanentnie usunięte.
                                </p>
                                <p className="modal-warning-text">
                                    Czy na pewno chcesz usunąć swoje konto?
                                </p>
                            </div>
                            <div className="modal-form-group">
                                <label htmlFor="deletePassword">Wpisz swoje hasło aby potwierdzić</label>
                                <input
                                    type="password" id="deletePassword" value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Twoje hasło"
                                />
                            </div>
                            {deleteError && (<div className="modal-error">{deleteError}</div>)}
                            <div className="modal-buttons">
                                <button type="button" className="modal-btn-cancel"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletePassword('');
                                        setDeleteError('');
                                    }}
                                >
                                    Nie, zachowaj konto
                                </button>
                                <button type="submit" className="modal-btn-delete">
                                    Tak, usuń konto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className="toast-container">
                    <div className="toast success">{toast}</div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;