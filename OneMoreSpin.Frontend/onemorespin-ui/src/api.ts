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
    dateOfGame: string; // Zwróć uwagę, że DateTime z C# staje się stringiem w JSON
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

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("jwt");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText;
    try {
      const obj = JSON.parse(text);
      if (obj) {
        if (typeof obj.error === 'string') message = obj.error;
        else if (Array.isArray(obj.errors)) message = obj.errors.join(', ');
        else if (typeof obj.message === 'string') message = obj.message;
      }
    } catch {
      if (text) message = text;
    }
    throw new Error(message || res.statusText);
  }
  try { return JSON.parse(text) as T; } catch { return {} as T; }
}

export const api = {
  auth: {
    register(payload: {
      email: string; password: string; name: string; surname: string; dateOfBirth: string;
    }) {
      return request<{ message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          
          dateOfBirth: payload.dateOfBirth
        }),
      });
    },

    login(payload: { email: string; password: string }) {
      return request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    me() {
      return request("/users/me");
    }
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
    }
  },
payment: {
    createCheckoutSession: (amount: number) => {
      return request<{ url: string }>("/payment/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
    },

    getHistory: () => {
      return request<PaymentHistoryItem[]>("/profile/payments"); // Poprawiona ścieżka
    },

    createWithdrawal: (amount: number) => {
      return request<{ newBalance: number }>("/payment/withdraw", {
          method: "POST",
          body: JSON.stringify({ amount }),
      });
    }
  },
  game: {
        getHistory: () => {
            return request<GameHistoryItemVm[]>("/profile/games"); // Poprawiona ścieżka
        }
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
        winDetails: { paylineIndex: number, count: number }[];
      }>("/Slots/spin", {
        method: "POST",
        body: JSON.stringify({ bet }),
      });
    }
  }
};
