export type UserMissionVm = {
  MissionId: number;
  Name: string;
  Description: string;
  CurrentProgress: number;
  RequiredAmount: number;
  RewardAmount: number;
  IsCompleted: boolean;
  IsClaimed: boolean;
};

export type UserInfo = {
  id: number;
  email: string;
  name: string;
  surname: string;
  isVip: boolean;
  balance: number;
};

export const API_BASE = import.meta.env.VITE_API_BASE as string;

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

export type ClaimDailyRewardResponse = {
    success: boolean;
    amount: number;
    dailyStreak: number;
};

export type DailyRewardStatusResponse = {
    canClaim: boolean;
    currentStreak: number;
    nextRewardStreak: number;
    nextRewardAmount: number;
    lastClaimedDate?: string;
    timeUntilNextClaim?: number; // sekundy
};

export type RouletteBetVm = {
  type: string;
  value: string;
  amount: number;
};

export type RouletteSpinRequestVm = {
  bets: RouletteBetVm[];
};

export type RouletteSpinResultVm = {
  winNumber: number;
  isWin: boolean;
  winAmount: number;
  message: string;
  balance: number;
  winColor: string;
};

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("jwt");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText;
    try {
      const obj = JSON.parse(text);
      if (obj) {
        if (typeof obj.error === "string") message = obj.error;
        else if (Array.isArray(obj.errors)) message = obj.errors.join(", ");
        else if (typeof obj.message === "string") message = obj.message;
      }
    } catch {
      if (text) message = text;
    }
    throw new Error(message || res.statusText);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export const api = {
    missions: {
      getUserMissions(): Promise<UserMissionVm[]> {
        return request<UserMissionVm[]>("/Missions");
      },
      claimMissionReward(missionId: number): Promise<{ message: string }> {
        return request<{ message: string }>(`/Missions/${missionId}/claim`, { method: "POST" });
      },
    },
  auth: {
    register(payload: {
      email: string;
      password: string;
      name: string;
      surname: string;
      dateOfBirth: string;
    }) {
      return request<{ message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...payload,

          dateOfBirth: payload.dateOfBirth,
        }),
      });
    },

    login(payload: { email: string; password: string }) {
      return request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    forgotPassword(payload: { email: string }) {
      return request<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    resetPassword(payload: { email: string; token: string; newPassword: string; confirmNewPassword: string }) {
      return request<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    me() {
      return request("/users/me");
    },
  },

  users: {
    changePassword(payload: { currentPassword: string; newPassword: string }) {
      return request<{ message: string }>("/users/change-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    deleteAccount(payload: { password: string }) {
      return request<{ message: string }>("/users/delete-account", {
        method: "DELETE",
        body: JSON.stringify(payload),
      });
    },
  },
  payment: {
    createCheckoutSession: (amount: number) => {
      return request<{ url: string }>("/payment/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
    },

    getHistory: () => {
      return request<PaymentHistoryItem[]>("/profile/payments");
    },

    createWithdrawal: (amount: number) => {
      return request<{ newBalance: number }>("/payment/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
    },
  },
  game: {
    getHistory: () => {
      return request<GameHistoryItemVm[]>("/profile/games");
    },
  },

  reward: {
    claimDaily: () => {
      return request<ClaimDailyRewardResponse>("/profile/claim-daily-reward", {
        method: "POST",
      });
    },
    
    getStatus: () => {
      return request<DailyRewardStatusResponse>("/profile/daily-reward-status");
    }
  },

  slots: {
    spin(bet: number) {
      return request<{
        grid: string[][];
        win: number;
        balance: number;
        isWin: boolean;
        winDetails: {
          paylineIndex: number;
          count: number;
          multiplier: number;
          PaylineIndex: number;
          Count: number;
          Multiplier: number;
        }[];
      }>("/Slots/spin", {
        method: "POST",
        body: JSON.stringify({ bet }),
      });
    },
  },

  roulette: {
    spin(payload: RouletteSpinRequestVm): Promise<RouletteSpinResultVm> {
      return request<RouletteSpinResultVm>("/Roulette/spin", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  poker: {
    start(betAmount: number) {
      return request<any>("/singlepoker/start", {
        method: "POST",
        body: JSON.stringify({ betAmount }),
      });
    },
    draw(sessionId: number, indices: number[]) {
      return request<any>("/singlepoker/draw", {
        method: "POST",
        body: JSON.stringify({ sessionId, indices }),
      });
    },
  },

  blackjack: {
    start(bet: number) {
      return request<{
        sessionId: number;
        playerHand: { rank: string; suit: string; value: number }[];
        dealerHand: { rank: string; suit: string; value: number }[];
        playerScore: number;
        dealerScore: number;
        gameState: string;
        result: string;
        bet: number;
        payout: number;
        balance: number;
        canHit: boolean;
        canStand: boolean;
        canDouble: boolean;
        gameFinished: boolean;
      }>("/Blackjack/start", {
        method: "POST",
        body: JSON.stringify({ bet }),
      });
    },
    hit(sessionId: number) {
      return request<{
        sessionId: number;
        playerHand: { rank: string; suit: string; value: number }[];
        dealerHand: { rank: string; suit: string; value: number }[];
        playerScore: number;
        dealerScore: number;
        gameState: string;
        result: string;
        bet: number;
        payout: number;
        balance: number;
        canHit: boolean;
        canStand: boolean;
        canDouble: boolean;
        gameFinished: boolean;
      }>("/Blackjack/hit", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
    },
    stand(sessionId: number) {
      return request<{
        sessionId: number;
        playerHand: { rank: string; suit: string; value: number }[];
        dealerHand: { rank: string; suit: string; value: number }[];
        playerScore: number;
        dealerScore: number;
        gameState: string;
        result: string;
        bet: number;
        payout: number;
        balance: number;
        canHit: boolean;
        canStand: boolean;
        canDouble: boolean;
        gameFinished: boolean;
      }>("/Blackjack/stand", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
    },
    double(sessionId: number) {
      return request<{
        sessionId: number;
        playerHand: { rank: string; suit: string; value: number }[];
        dealerHand: { rank: string; suit: string; value: number }[];
        playerScore: number;
        dealerScore: number;
        gameState: string;
        result: string;
        bet: number;
        payout: number;
        balance: number;
        canHit: boolean;
        canStand: boolean;
        canDouble: boolean;
        gameFinished: boolean;
      }>("/Blackjack/double", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
    },
  },
  leaderboard: {
    getByGameId(gameId: number) {
      return request<{ email?: string; Email?: string; moneyWon?: number; MoneyWon?: number }[]>(
        `/leaderboard/game/${gameId}`
      ).then((rows) =>
        rows.map((r) => ({
          Email: r.Email ?? r.email ?? "",
          MoneyWon: r.MoneyWon ?? r.moneyWon ?? 0,
        }))
      );
    },
    getByGameName(gameName: string) {
      return request<{ email?: string; Email?: string; moneyWon?: number; MoneyWon?: number }[]>(
        `/leaderboard/game/name/${encodeURIComponent(gameName)}`
      ).then((rows) =>
        rows.map((r) => ({
          Email: r.Email ?? r.email ?? "",
          MoneyWon: r.MoneyWon ?? r.moneyWon ?? 0,
        }))
      );
    },
    getGlobal() {
      return request<{ email?: string;  moneyWon?: number }[]>(
        `/leaderboard`
      ).then((rows) =>
        rows.map((r) => ({
          Email: r.email ?? "",
          MoneyWon: r.moneyWon ?? 0,
        }))
      );
    },
  },
};
