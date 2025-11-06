import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A1.875 1.875 0 0 1 18 22.5H6a1.875 1.875 0 0 1-1.499-2.382Z" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 1-2.25 2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 1 3 12m18 0v-2.25a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 0-6 0H5.25A2.25 2.25 0 0 0 3 9.75v2.25m18 0A2.25 2.25 0 0 1 18.75 14.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 1 3 12m18 0v-2.25" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M3.75 18H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M3.75 12H7.5" /></svg>;
const SecurityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>;


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

const bentoCardClass = "bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:border-zinc-700";

interface CardHeaderProps {
    icon: React.ReactNode; 
    title: string;
}

const CardHeader = ({ icon, title }: CardHeaderProps) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-zinc-800">
            {icon}
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
);


function UserProfile() {
    const navigate = useNavigate();
    const [me, setMe] = useState<MeUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Fetch real user data
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            navigate('/');
            return;
        }
        (async () => {
            try {
                const user = await api.auth.me();
                setMe(user);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to load profile';
                setError(msg);
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
    const [activeTab, setActiveTab] = useState('transakcje');
    const [teleportLeft, setTeleportLeft] = useState(37.5); 
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null); 

    const activeTabClass = "py-2 px-5 rounded-full font-semibold text-sm bg-zinc-700 text-white shadow-md";
    const inactiveTabClass = "py-2 px-5 rounded-full font-medium text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors";

    const renderTabContent = () => {
        switch (activeTab) {
            case 'transakcje':
                return (
                    <table className="min-w-full text-sm text-left">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Data</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Typ</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Kwota</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Saldo po operacji</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                    {transactionData.map((tx) => (
                                <tr key={tx.id} className="transition-colors hover:bg-zinc-800/50">
                                    <td className="p-4 text-zinc-400">{tx.date}</td>
                                    <td className="p-4 font-medium text-zinc-200">{tx.type}</td>
                                    <td className={`p-4 font-medium ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.amount}
                                    </td>
                                    <td className="p-4 text-zinc-200">{tx.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'gry':
                 return (
                    <table className="min-w-full text-sm text-left">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Data</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Gra</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Wynik</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Stawka</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Wygrana/Strata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {gameData.map((game) => (
                                <tr key={game.id} className="transition-colors hover:bg-zinc-800/50">
                                    <td className="p-4 text-zinc-400">{game.date}</td>
                                    <td className="p-4 font-medium text-zinc-200">{game.game}</td>
                                    <td className="p-4 text-zinc-200">{game.result}</td>
                                    <td className="p-4 text-red-400">{game.stake}</td>
                                    <td className="p-4 font-medium text-green-400">{game.win}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'logowania':
                return (
                    <table className="min-w-full text-sm text-left">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Data</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Status</th>
                                <th className="p-4 font-semibold tracking-wider uppercase text-zinc-500">Adres IP (Log)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loginData.map((login) => (
                                <tr key={login.id} className="transition-colors hover:bg-zinc-800/50">
                                    <td className="p-4 text-zinc-400">{login.date}</td>
                                    <td className="p-4 font-medium text-green-400">{login.status}</td>
                                    <td className="p-4 text-zinc-500">{login.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };
    
    const stopTeleporting = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTeleportLeft(37.5); 
    };

    const startTeleporting = () => {
        stopTeleporting(); 
        
        intervalRef.current = setInterval(() => {
            const newLeft = Math.random() > 0.5 ? 0 : 75;
            setTeleportLeft(newLeft);
        }, 100); 
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordError('Wszystkie pola są wymagane');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Nowe hasło musi mieć co najmniej 6 znaków');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError('Nowe hasła nie są zgodne');
            return;
        }

        setPasswordLoading(true);
        try {
            const result = await api.auth.changePassword({
                currentPassword,
                newPassword,
            });
            setPasswordSuccess(result.message || 'Hasło zostało zmienione');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Nie udało się zmienić hasła';
            setPasswordError(msg);
        } finally {
            setPasswordLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-200">
                <div className="px-6 py-4 border shadow rounded-xl border-zinc-800 bg-zinc-900">Ładowanie profilu…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-200">
                <div className="px-6 py-5 space-y-3 text-red-200 border rounded-xl border-red-800/40 bg-red-950/40">
                    <div className="font-semibold">Nie udało się pobrać profilu</div>
                    <div className="text-sm opacity-90">{error}</div>
                    <button onClick={() => navigate('/')} className="px-4 py-2 mt-2 text-sm text-white rounded-lg bg-zinc-800 hover:bg-zinc-700">Wróć</button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-4 bg-gradient-to-br from-purple-600 to-indigo-700 text-zinc-200 sm:p-6 lg:p-8">
            

            <div className="absolute z-10 top-4 left-4 sm:top-6 sm:left-8">
                <button onClick={() => navigate('/home')} className="px-5 py-2 text-sm font-medium text-white transition-all border rounded-full bg-zinc-800/50 backdrop-blur-md border-zinc-700 hover:bg-zinc-700/70">
                    ← Powrót do lobby
                </button>
            </div>

            <div className="container mx-auto max-w-7xl">

                <header className="mt-16 mb-8 sm:mt-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Mój Profil
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 auto-rows-[minmax(180px,_auto)] gap-4">

                    <div className={`${bentoCardClass} lg:col-span-2`}>
                        <CardHeader icon={<UserIcon />} title="Dane Gracza" />
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Nazwa użytkownika:</span>
                                <span className="font-medium text-zinc-100">{displayName}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Adres e-mail:</span>
                                <span className="font-medium text-zinc-100">{me?.email}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Status konta:</span>
                                <span className="px-3 py-1 text-sm font-medium text-green-300 border rounded-full bg-green-500/10 border-green-500/20">{statusText}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">Status VIP:</span>
                                <span className="px-3 py-1 text-sm font-medium rounded-full text-zinc-100 bg-zinc-700">{vipText}</span>
                            </li>
                        </ul>
                    </div>

                    <div className={`${bentoCardClass} lg:col-span-2`}>
                        <CardHeader icon={<WalletIcon />} title="Mój Portfel" />
                        
                        <div className="my-2">
                            <p className="text-sm tracking-wider uppercase text-zinc-400">Aktualne Saldo</p>
                            <p className="mt-1 text-5xl font-bold text-white">{balanceText}</p>
                        </div>
                        
                        <div className="mt-4 mb-6 text-sm text-zinc-400">
                            <p>+100 Monet za jutrzejsze logowanie!</p>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-zinc-200 transition-colors text-base transform hover:scale-[1.02]">
                                Wpłać
                            </button>
                            
                            <div 
                                className="relative w-full h-12" 
                                onMouseEnter={startTeleporting}
                                onMouseLeave={stopTeleporting}
                            >
                                <button 
                                    className="absolute w-1/4 px-4 py-3 font-medium transition-all duration-100 ease-out rounded-lg bg-zinc-800 text-zinc-100"
                                    style={{ left: `${teleportLeft}%` }}
                                >
                                    Wypłać
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`${bentoCardClass} lg:col-span-3 lg:row-span-2`}>
                        <CardHeader icon={<HistoryIcon />} title="Historia Aktywności" />

                        <div className="bg-zinc-800 p-1.5 rounded-full flex justify-start space-x-1 mb-6 max-w-md">
                            <button 
                                className={activeTab === 'transakcje' ? activeTabClass : inactiveTabClass}
                                onClick={() => setActiveTab('transakcje')}
                            >
                                Transakcje
                            </button>
                            <button 
                                className={activeTab === 'gry' ? activeTabClass : inactiveTabClass}
                                onClick={() => setActiveTab('gry')}
                            >
                                Gry
                            </button>
                            <button 
                                className={activeTab === 'logowania' ? activeTabClass : inactiveTabClass}
                                onClick={() => setActiveTab('logowania')}
                            >
                                Logowania
                            </button>
                        </div>

                        <div className="overflow-x-auto tab-content">
                            {renderTabContent()}
                        </div>
                    </div>

                    <div className={`${bentoCardClass} lg:col-span-1`}>
                        <CardHeader icon={<SettingsIcon />} title="Ustawienia" />
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="motyw" className="block mb-2 text-sm font-medium text-zinc-300">Motyw</label>
                                <select id="motyw" name="motyw" className="w-full p-3 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-white/50 focus:border-white/50">
                                    <option>Ciemny (Domyślny)</option>
                                    <option>Jasny (Już wkrótce)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="jezyk" className="block mb-2 text-sm font-medium text-zinc-300">Język</label>
                                <select id="jezyk" name="jezyk" className="w-full p-3 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-white/50 focus:border-white/50">
                                    <option value="pl">Polski</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={`${bentoCardClass} lg:col-span-1`}>
                        <CardHeader icon={<SecurityIcon />} title="Bezpieczeństwo" />
                        <div className="space-y-3">
                             <button onClick={() => setShowPasswordModal(true)} className="w-full px-4 py-3 font-medium transition-colors rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700">
                                Zmień hasło
                            </button>
                            <button onClick={() => { localStorage.removeItem('jwt'); localStorage.removeItem('user'); navigate('/'); }} className="w-full px-4 py-3 font-medium text-red-300 transition-colors border rounded-lg bg-red-900/50 hover:bg-red-900/80 hover:text-red-200 border-red-500/20">
                                Wyloguj
                            </button>
                        </div>
                    </div>

                </div>

            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}>
                    <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-6 text-2xl font-bold text-white">Zmiana hasła</h2>
                        
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-zinc-300">
                                    Aktualne hasło
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    placeholder="Wpisz aktualne hasło"
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-zinc-300">
                                    Nowe hasło
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    placeholder="Wpisz nowe hasło (min. 6 znaków)"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmNewPassword" className="block mb-2 text-sm font-medium text-zinc-300">
                                    Potwierdź nowe hasło
                                </label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    placeholder="Potwierdź nowe hasło"
                                />
                            </div>

                            {passwordError && (
                                <div className="p-3 text-sm text-red-200 border rounded-lg bg-red-950/40 border-red-800/40">
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="p-3 text-sm text-green-200 border rounded-lg bg-green-950/40 border-green-800/40">
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError('');
                                        setPasswordSuccess('');
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmNewPassword('');
                                    }}
                                    className="flex-1 px-4 py-3 font-medium transition-colors border rounded-lg text-zinc-300 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 px-4 py-3 font-bold text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {passwordLoading ? 'Zmieniam...' : 'Zmień hasło'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;