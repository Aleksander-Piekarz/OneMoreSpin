import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();
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
          setError(t('admin.noPermissions'));
        } else {
          throw new Error(t('admin.serverError'));
        }
        return;
      }

      const data: AdminUsersListVm = await response.json();
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, []);

  const handleDelete = async (userId: number) => {
    if (!confirm(t('admin.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert(t('admin.userDeleted'));
        fetchUsers(page);
      } else {
        alert(t('admin.deleteError'));
      }
    } catch (err) {
      alert(t('common.error') + ': ' + err);
    }
  };

  const handleUpdateBalance = async (userId: number) => {
    const newBalance = prompt(t('admin.enterBalance'));
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
        alert(t('admin.balanceUpdated'));
        fetchUsers(page);
      } else {
        alert(t('admin.updateError'));
      }
    } catch (err) {
      alert(t('common.error') + ': ' + err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.surname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-loading">{t('admin.loading')}</div>;
  if (error) return <div className="admin-error">{t('admin.error')} {error}</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">🛡️ {t('admin.title')}</h1>
          <button onClick={() => navigate('/home')} className="admin-back-btn">
            ← {t('common.back')}
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">{t('admin.users')}</div>
            <div className="admin-stat-value">{totalCount}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">{t('admin.active')}</div>
            <div className="admin-stat-value">{users.filter(u => u.isActive).length}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">⭐</div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">{t('admin.vip')}</div>
            <div className="admin-stat-value">{users.filter(u => u.isVip).length}</div>
          </div>
        </div>
      </div>

      <div className="admin-search-bar">
        <input
          type="text"
          placeholder={t('admin.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.id')}</th>
              <th>{t('admin.email')}</th>
              <th>{t('admin.name')}</th>
              <th>{t('admin.surname')}</th>
              <th>{t('admin.balance')}</th>
              <th>{t('admin.isVip')}</th>
              <th>{t('admin.status')}</th>
              <th>{t('admin.actions')}</th>
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
                    <span className="admin-badge admin-badge-vip">⭐ {t('admin.isVip')}</span>
                  ) : (
                    <span className="admin-badge admin-badge-regular">{t('admin.users')}</span>
                  )}  
                </td>
                <td>
                  {user.isActive ? (
                    <span className="admin-badge admin-badge-active">✅ {t('admin.isActive')}</span>
                  ) : (
                    <span className="admin-badge admin-badge-inactive">❌ {t('common.error')}</span>
                  )}
                </td>
                <td>
                  <div className="admin-actions">
                    <button
                      onClick={() => handleUpdateBalance(user.id)}
                      className="admin-btn admin-btn-balance"
                      title={t('admin.updateBalance')}
                    >
                      💰
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="admin-btn admin-btn-delete"
                      title={t('admin.delete')}
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
          {t('admin.previous')}
        </button>
        <span className="admin-pagination-info">
          {t('admin.page')} {page} {t('admin.of')} {Math.ceil(totalCount / 20)}
        </span>
        <button
          onClick={() => fetchUsers(page + 1)}
          disabled={users.length < 20}
          className="admin-pagination-btn"
        >
          {t('admin.next')}
        </button>
      </div>
    </div>
  );
}
