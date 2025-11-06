import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserData {
  email?: string;
  name?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const userData = localStorage.getItem("user");

    if (!token) {
      navigate("/");
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
      <div className="absolute z-10 top-4 right-4">
        <button
          onClick={() => navigate("/profile")}
          className="px-4 py-2 text-sm font-semibold text-white transition-all border rounded-full border-white/30 bg-white/10 backdrop-blur hover:bg-white/20 md:text-base"
        >
          Your Profile
        </button>
      </div>
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white shadow-2xl rounded-2xl md:p-12">
        <div className="text-center">
          <h1 className="text-5xl font-black text-gray-900 font-shoulders md:text-6xl">
            Welcome Back!
          </h1>
          
          {user && (
            <div className="mt-4 space-y-2">
              {user.name && (
                <p className="text-xl text-gray-600">
                  Hello, <span className="font-semibold text-gray-900">{user.name}</span>!
                </p>
              )}
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}
        </div>

        <div className="pt-6 space-y-4">
          <button
            onClick={() => navigate("/profile")}
            className="w-full rounded-lg bg-black py-4 text-lg font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border-2 border-gray-300 bg-white py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Log Out
          </button>
        </div>

        <div className="grid gap-4 pt-6 mt-8 border-t border-gray-200 md:grid-cols-3">
          <div className="p-6 text-center rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="text-3xl font-black text-purple-600">$0</div>
            <div className="mt-1 text-sm font-semibold text-gray-600">Balance</div>
          </div>
          
          <div className="p-6 text-center rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-3xl font-black text-blue-600">0</div>
            <div className="mt-1 text-sm font-semibold text-gray-600">Games Played</div>
          </div>
          
          <div className="p-6 text-center rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-3xl font-black text-green-600">0</div>
            <div className="mt-1 text-sm font-semibold text-gray-600">Wins</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
