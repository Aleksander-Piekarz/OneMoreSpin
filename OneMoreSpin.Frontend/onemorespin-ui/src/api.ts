export const API_BASE = import.meta.env.VITE_API_BASE as string;

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("jwt");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
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
          // input type="date" w React zwraca "YYYY-MM-DD" — taki format akceptuje backend
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
      return request("/auth/me");
    }
  }
};
