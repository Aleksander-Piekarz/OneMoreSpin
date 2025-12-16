import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';
import '../styles/AdminPage.css';

type UserProfile = {
  id: number;
  userName: string;
  email: string;
  name: string;
  surname: string;
  balance: number;
  isVip: boolean;
  isActive: boolean;
  createdAt: string;
};

type AdminUsersListVm = {
  users: UserProfile[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/users?page=${pageNum}&pageSize=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Brak uprawnień administratora');
        } else {
          throw new Error('Błąd serwera');
        }
        return;
      }

      const data: AdminUsersListVm = await response.json();
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, []);

  const handleDelete = async (userId: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;

    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Użytkownik usunięty');
        fetchUsers(page);
      } else {
        alert('Błąd podczas usuwania');
      }
    } catch (err) {
      alert('Błąd: ' + err);
    }
  };

  const handleUpdateBalance = async (userId: number) => {
    const newBalance = prompt('Podaj nowy balans:');
    if (!newBalance) return;

    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(parseFloat(newBalance))
      });

      if (response.ok) {
        alert('Balans zaktualizowany');
        fetchUsers(page);
      } else {
        alert('Błąd podczas aktualizacji balansu');
      }
    } catch (err) {
      alert('Błąd: ' + err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-loading">⏳ Ładowanie...</div>;
  if (error) return <div className="admin-error">❌ {error}</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">🛡️ Panel Administratora</h1>
          <button onClick={() => navigate('/home')} className="admin-back-btn">
            ← Powrót
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Użytkownicy</div>
            <div className="admin-stat-value">{totalCount}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Aktywni</div>
            <div className="admin-stat-value">{users.filter(u => u.isActive).length}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">⭐</div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">VIP</div>
            <div className="admin-stat-value">{users.filter(u => u.isVip).length}</div>
          </div>
        </div>
      </div>

      <div className="admin-search-bar">
        <input
          type="text"
          placeholder="🔍 Szukaj użytkownika..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Imię</th>
              <th>Nazwisko</th>
              <th>Balans</th>
              <th>VIP</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="admin-table-row">
                <td>#{user.id}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.surname}</td>
                <td className="admin-balance">${user.balance.toFixed(2)}</td>
                <td>
                  {user.isVip ? (
                    <span className="admin-badge admin-badge-vip">⭐ VIP</span>
                  ) : (
                    <span className="admin-badge admin-badge-regular">Użytkownik</span>
                  )}  
                </td>
                <td>
                  {user.isActive ? (
                    <span className="admin-badge admin-badge-active">✅ Aktywny</span>
                  ) : (
                    <span className="admin-badge admin-badge-inactive">❌ Nieaktywny</span>
                  )}
                </td>
                <td>
                  <div className="admin-actions">
                    <button
                      onClick={() => handleUpdateBalance(user.id)}
                      className="admin-btn admin-btn-balance"
                      title="Zmień balans"
                    >
                      💰
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="admin-btn admin-btn-delete"
                      title="Usuń użytkownika"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button
          onClick={() => fetchUsers(page - 1)}
          disabled={page <= 1}
          className="admin-pagination-btn"
        >
          ← Poprzednia
        </button>
        <span className="admin-pagination-info">
          Strona {page} / {Math.ceil(totalCount / 20)}
        </span>
        <button
          onClick={() => fetchUsers(page + 1)}
          disabled={users.length < 20}
          className="admin-pagination-btn"
        >
          Następna →
        </button>
      </div>
    </div>
  );
}
