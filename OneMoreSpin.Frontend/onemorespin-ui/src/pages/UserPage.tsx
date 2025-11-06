import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import '../styles/UserPage.css';

const UserIcon = () => <span className="userpage-card-header-icon">👤</span>;
const WalletIcon = () => <span className="userpage-card-header-icon">💰</span>;
const HistoryIcon = () => <span className="userpage-card-header-icon">📜</span>;
const SecurityIcon = () => <span className="userpage-card-header-icon">🔒</span>;

type MeUser = {
    id: number;
    email: string;
    name: string;
    surname: string;
    isVip: boolean;
    balance: number;
};

const transactionData = [
    { id: 1, date: "20.10.2025, 14:30", type: "Wpłata", amount: "+100.00 PLN", balance: "1,250.00 PLN" },
    { id: 2, date: "19.10.2025, 20:15", type: "Wygrana (Ruletka)", amount: "+50.00 PLN", balance: "1,150.00 PLN" },
    { id: 3, date: "19.10.2025, 20:14", type: "Stawka (Ruletka)", amount: "-10.00 PLN", balance: "1,100.00 PLN" },
    { id: 4, date: "18.10.2025, 12:00", type: "Bonus (Logowanie)", amount: "+10.00 PLN", balance: "1,110.00 PLN" },
];

const gameData = [
    { id: 1, date: "19.10.2025, 20:15", game: "Ruletka", result: "Trafiono numer 5", stake: "10.00 PLN", win: "+50.00 PLN" },
    { id: 2, date: "19.10.2025, 18:30", game: "Blackjack", result: "Przegrana", stake: "25.00 PLN", win: "0.00 PLN" },
    { id: 3, date: "18.10.2025, 21:00", game: "Slot Machine", result: "Jackpot", stake: "5.00 PLN", win: "+500.00 PLN" },
];

const loginData = [
    { id: 1, date: "20.10.2025, 14:29", status: "Udane", ip: "123.45.67.89 (Ukryte)" },
    { id: 2, date: "19.10.2025, 18:28", status: "Udane", ip: "123.45.67.89 (Ukryte)" },
    { id: 3, date: "18.10.2025, 11:59", status: "Udane", ip: "123.45.67.89 (Ukryte)" },
];

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
    const [me, setMe] = useState<MeUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'transakcje' | 'gry' | 'logowania'>('transakcje');
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
    const displayName = useMemo(() => {
        if (!me) return '';
        const full = `${me.name ?? ''} ${me.surname ?? ''}`.trim();
        if (full) return full;
        return me.email?.split('@')[0] ?? 'User';
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
    
    if (loading || !me) {
        return null;
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
                                <span className="userpage-value">{me?.email}</span>
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
                        <button className="userpage-btn">WPŁAĆ</button>
                        <button className="userpage-btn">WYPŁAĆ</button>
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
                            <button 
                                className={`userpage-tab${activeTab==='logowania'?' active':''}`} 
                                onClick={()=>setActiveTab('logowania')}
                            >
                                LOGOWANIA
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
                                            <th>Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactionData.map(tx=>(
                                            <tr key={tx.id}>
                                                <td>{tx.date}</td>
                                                <td>{tx.type}</td>
                                                <td>{tx.amount}</td>
                                                <td>{tx.balance}</td>
                                            </tr>
                                        ))}
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
                                        {gameData.map(game=>(
                                            <tr key={game.id}>
                                                <td>{game.date}</td>
                                                <td>{game.game}</td>
                                                <td>{game.result}</td>
                                                <td>{game.stake}</td>
                                                <td>{game.win}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {activeTab==='logowania' && (
                                <table className="userpage-table">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Status</th>
                                            <th>Adres IP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loginData.map(login=>(
                                            <tr key={login.id}>
                                                <td>{login.date}</td>
                                                <td>{login.status}</td>
                                                <td>{login.ip}</td>
                                            </tr>
                                        ))}
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
            
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Zmiana hasła</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setPasswordError('');
                            setPasswordSuccess('');
                            
                            if (!currentPassword || !newPassword || !confirmPassword) {
                                setPasswordError('Wszystkie pola są wymagane');
                                return;
                            }
                            if (newPassword.length < 6) {
                                setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków');
                                return;
                            }
                            if (newPassword !== confirmPassword) {
                                setPasswordError('Nowe hasła nie są zgodne');
                                return;
                            }
                            
                            try {
                                await api.users.changePassword({
                                    currentPassword,
                                    newPassword
                                });
                                setPasswordSuccess('Hasło zostało zmienione pomyślnie');
                                setTimeout(() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setPasswordError('');
                                    setPasswordSuccess('');
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
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Wpisz aktualne hasło"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label htmlFor="newPassword">Nowe hasło</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Wpisz nowe hasło (min. 6 znaków)"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label htmlFor="confirmPassword">Potwierdź nowe hasło</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Potwierdź nowe hasło"
                                />
                            </div>
                            
                            {passwordError && (
                                <div className="modal-error">{passwordError}</div>
                            )}
                            {passwordSuccess && (
                                <div className="modal-success">{passwordSuccess}</div>
                            )}
                            
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="modal-btn-cancel"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setPasswordError('');
                                        setPasswordSuccess('');
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
                                setDeleteError('Wpisz hasło aby potwierdzić');
                                return;
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
                                    type="password"
                                    id="deletePassword"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Twoje hasło"
                                />
                            </div>
                            
                            {deleteError && (
                                <div className="modal-error">{deleteError}</div>
                            )}
                            
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="modal-btn-cancel"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletePassword('');
                                        setDeleteError('');
                                    }}
                                >
                                    Nie, zachowaj konto
                                </button>
                                <button
                                    type="submit"
                                    className="modal-btn-delete"
                                >
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