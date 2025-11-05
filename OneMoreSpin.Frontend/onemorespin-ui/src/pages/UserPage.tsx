import React, { useState, useRef } from 'react';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A1.875 1.875 0 0 1 18 22.5H6a1.875 1.875 0 0 1-1.499-2.382Z" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 1-2.25 2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 1 3 12m18 0v-2.25a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 0-6 0H5.25A2.25 2.25 0 0 0 3 9.75v2.25m18 0A2.25 2.25 0 0 1 18.75 14.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 1 3 12m18 0v-2.25" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M3.75 18H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0M3.75 12H7.5" /></svg>;
const SecurityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>;


const userData = {
    username: "Gracz123",
    email: "cos@cos.pl",
    status: "Aktywne",
    vip: "Złoty",
    balance: "2,137.00 PLN"
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
        <div className="bg-zinc-800 p-2 rounded-lg">
            {icon}
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
);


function UserProfile() {
    const [activeTab, setActiveTab] = useState('transakcje');
    const [teleportLeft, setTeleportLeft] = useState(37.5); 
    const intervalRef = useRef<any>(null); 

    const activeTabClass = "py-2 px-5 rounded-full font-semibold text-sm bg-zinc-700 text-white shadow-md";
    const inactiveTabClass = "py-2 px-5 rounded-full font-medium text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors";

    const renderTabContent = () => {
        switch (activeTab) {
            case 'transakcje':
                return (
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Typ</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Kwota</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Saldo po operacji</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {transactionData.map((tx) => (
                                <tr key={tx.id} className="hover:bg-zinc-800/50 transition-colors">
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
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Gra</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Wynik</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Stawka</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Wygrana/Strata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {gameData.map((game) => (
                                <tr key={game.id} className="hover:bg-zinc-800/50 transition-colors">
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
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-zinc-800">
                            <tr>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 font-semibold text-zinc-500 uppercase tracking-wider">Adres IP (Log)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loginData.map((login) => (
                                <tr key={login.id} className="hover:bg-zinc-800/50 transition-colors">
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


    return (
        <div className="bg-zinc-950 text-zinc-200 min-h-screen relative p-4 sm:p-6 lg:p-8">
            

            <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
                <button className="bg-zinc-800/50 backdrop-blur-md border border-zinc-700 text-white text-sm font-medium py-2 px-5 rounded-full hover:bg-zinc-700/70 transition-all">
                    ← Powrót do lobby
                </button>
            </div>

            <div className="container mx-auto max-w-7xl">

                <header className="mb-8 mt-16 sm:mt-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Mój Profil
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 auto-rows-[minmax(180px,_auto)] gap-4">

                    <div className={`${bentoCardClass} lg:col-span-2`}>
                        <CardHeader icon={<UserIcon />} title="Dane Gracza" />
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center">
                                <span className="text-zinc-400 text-sm">Nazwa użytkownika:</span>
                                <span className="font-medium text-zinc-100">{userData.username}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-zinc-400 text-sm">Adres e-mail:</span>
                                <span className="font-medium text-zinc-100">{userData.email}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-zinc-400 text-sm">Status konta:</span>
                                <span className="font-medium text-green-300 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-sm">{userData.status}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-zinc-400 text-sm">Status VIP:</span>
                                <span className="font-medium text-zinc-100 bg-zinc-700 px-3 py-1 rounded-full text-sm">{userData.vip}</span>
                            </li>
                        </ul>
                    </div>

                    <div className={`${bentoCardClass} lg:col-span-2`}>
                        <CardHeader icon={<WalletIcon />} title="Mój Portfel" />
                        
                        <div className="my-2">
                            <p className="text-sm text-zinc-400 uppercase tracking-wider">Aktualne Saldo</p>
                            <p className="text-5xl font-bold text-white mt-1">{userData.balance}</p>
                        </div>
                        
                        <div className="text-sm text-zinc-400 mb-6 mt-4">
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
                                    className="absolute w-1/4 bg-zinc-800 text-zinc-100 font-medium py-3 px-4 rounded-lg transition-all duration-100 ease-out"
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

                        <div className="tab-content overflow-x-auto">
                            {renderTabContent()}
                        </div>
                    </div>

                    <div className={`${bentoCardClass} lg:col-span-1`}>
                        <CardHeader icon={<SettingsIcon />} title="Ustawienia" />
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="motyw" className="block text-sm font-medium text-zinc-300 mb-2">Motyw</label>
                                <select id="motyw" name="motyw" className="w-full p-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50">
                                    <option>Ciemny (Domyślny)</option>
                                    <option>Jasny (Już wkrótce)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="jezyk" className="block text-sm font-medium text-zinc-300 mb-2">Język</label>
                                <select id="jezyk" name="jezyk" className="w-full p-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50">
                                    <option value="pl">Polski</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={`${bentoCardClass} lg:col-span-1`}>
                        <CardHeader icon={<SecurityIcon />} title="Bezpieczeństwo" />
                        <div className="space-y-3">
                             <button className="w-full bg-zinc-800 text-zinc-100 font-medium py-3 px-4 rounded-lg hover:bg-zinc-700 transition-colors">
                                Zmień hasło
                            </button>
                            <button className="w-full bg-red-900/50 text-red-300 font-medium py-3 px-4 rounded-lg hover:bg-red-900/80 hover:text-red-200 border border-red-500/20 transition-colors">
                                Wyloguj
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default UserProfile;