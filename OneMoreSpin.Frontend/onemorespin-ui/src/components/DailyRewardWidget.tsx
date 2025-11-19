import React, { useState, useEffect } from 'react';
import { api, type DailyRewardStatusResponse } from '../api';
import '../styles/DailyRewardWidget.css';

interface DailyRewardWidgetProps {
    user: {
        dailyStreak: number;
        lastRewardClaimedDate?: string;
    };
    onRewardClaimed: () => void;
}

const DailyRewardWidget: React.FC<DailyRewardWidgetProps> = ({ user, onRewardClaimed }) => {
    const [status, setStatus] = useState<DailyRewardStatusResponse | null>(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [claimedAmount, setClaimedAmount] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const BASE_REWARD = 50;
    const MAX_STREAK_DAYS = 7;

    const calculateReward = (streak: number) => {
        const validStreak = Math.max(1, Math.min(streak, MAX_STREAK_DAYS));
        return BASE_REWARD + (BASE_REWARD * (validStreak - 1));
    };

    const fetchStatus = async () => {
        try {
            const data = await api.reward.getStatus();
            setStatus(data);
        } catch (error) {
            console.error('Nie udało się pobrać statusu bonusu:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [user.dailyStreak, user.lastRewardClaimedDate]);

    useEffect(() => {
        if (!status || status.canClaim || !status.timeUntilNextClaim) {
            setTimeRemaining('');
            return;
        }
        const updateTimer = () => {
            if (!status.timeUntilNextClaim) return;
            const now = new Date();
            const lastClaim = status.lastClaimedDate ? new Date(status.lastClaimedDate) : now;
            const lastClaimDateUTC = Date.UTC(lastClaim.getUTCFullYear(), lastClaim.getUTCMonth(), lastClaim.getUTCDate());
            const nextMidnightUTC = new Date(lastClaimDateUTC + 24 * 60 * 60 * 1000);
            const msLeft = nextMidnightUTC.getTime() - now.getTime();
            if (msLeft <= 0) { fetchStatus(); return; }
            const h = Math.floor(msLeft / (1000 * 60 * 60));
            const m = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((msLeft % (1000 * 60)) / 1000);
            setTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [status]);

    const handleClaim = async () => {
        if (!status || !status.canClaim || isClaiming) return;
        setIsClaiming(true);
        setErrorMsg('');
        try {
            const result = await api.reward.claimDaily();
            if (result && result.success && typeof result.amount === 'number') {
                setClaimedAmount(result.amount);
                setShowSuccess(true);
                setIsClaiming(false);
                await onRewardClaimed();
                await fetchStatus();
                setTimeout(() => setShowSuccess(false), 2500);
            } else {
                setErrorMsg('Nie można odebrać nagrody. Spróbuj ponownie później.');
                setTimeout(() => setErrorMsg(''), 4000);
                setIsClaiming(false);
            }
        } catch (error) {
            let msg = 'Błąd odbierania nagrody.';
            if (error instanceof Error) {
                msg = error.message;
                if (msg.includes('Nie można jeszcze odebrać')) {
                    onRewardClaimed();
                    fetchStatus();
                }
            }
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 4000);
            setIsClaiming(false);
        }
    };

    if (!status) return null;

    const alreadyClaimed = !status.canClaim;
    const claimableStreak = status.nextRewardStreak;
    const todayReward = calculateReward(claimableStreak);
    let tomorrowStreak: number;
    if (alreadyClaimed) {
        tomorrowStreak = claimableStreak;
    } else {
        tomorrowStreak = claimableStreak + 1;
        if (tomorrowStreak > MAX_STREAK_DAYS) tomorrowStreak = 1;
    }
    const tomorrowReward = calculateReward(tomorrowStreak);

    return (
        <>
            <button
                className={`drw-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                title="Dzienna nagroda"
            >
                🎁
            </button>
            {isExpanded && (
                <div className="daily-reward-widget">
                    <div className="drw-header">
                        <span className="drw-icon">🎁</span>
                        <h3 className="drw-title">Dzienna Nagroda</h3>
                    </div>
                    <div className="drw-info-row">
                        <div className="drw-info-item">
                            <div className="drw-info-label">Dziś odbierzesz:</div>
                            <div className="drw-info-value">{alreadyClaimed ? '✓ Odebrano' : `${todayReward} PLN`}</div>
                        </div>
                        <div className="drw-info-item">
                            <div className="drw-info-label">Jutro odbierzesz:</div>
                            <div className="drw-info-value">{tomorrowReward} PLN</div>
                        </div>
                    </div>
                    <div className="drw-days">
                        {[1,2,3,4,5,6,7].map(day => {
                            const reward = calculateReward(day);
                            const isCompleted = day <= status.currentStreak && status.currentStreak > 0;
                            const isClaimable = day === claimableStreak;
                            return (
                                <div
                                    key={day}
                                    className={`drw-day ${isCompleted ? 'completed' : ''} ${isClaimable ? 'current' : ''}`}
                                    title={`Dzień ${day}: ${reward} PLN`}
                                >
                                    <div className="drw-day-num">{day}</div>
                                    <div className="drw-day-amt">{reward}</div>
                                </div>
                            );
                        })}
                    </div>
                    {alreadyClaimed && timeRemaining && (
                        <div className="drw-next">
                            <span>Następna za: <strong className="drw-next1">{timeRemaining}</strong></span>
                        </div>
                    )}
                    <button
                        className="drw-claim-btn"
                        onClick={handleClaim}
                        disabled={alreadyClaimed || isClaiming}
                    >
                        {isClaiming ? 'Odbieranie...' : alreadyClaimed ? '✓ ODEBRANO!' : '🎁 ODBIERZ'}
                    </button>
                    {errorMsg && (
                        <div className="drw-timer" style={{ marginTop: 10, color: '#f44336', fontWeight: 700 }}>{errorMsg}</div>
                    )}
                    {showSuccess && (
                        <div className="drw-success">
                            <div className="drw-success-content">
                                <div className="drw-success-icon">🎉</div>
                                <div className="drw-success-text">Odebrano!</div>
                                <div className="drw-success-amount">+{claimedAmount} PLN</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default DailyRewardWidget;
