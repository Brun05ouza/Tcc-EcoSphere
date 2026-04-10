import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  Shield, Users, Zap, BarChart3, Search, MoreVertical, Crown,
  Trash2, Edit3, Plus, X, Check, Loader2, ChevronDown, AlertTriangle,
  ArrowLeft, RefreshCw, Sparkles, UserPlus, TrendingUp, Database
} from 'lucide-react';
import {
  adminGetAllUsers, adminSetEcoPoints, adminToggleAdmin,
  adminCreateUser, adminDeleteUser, adminGetStats
} from '../services/supabaseService';

// ── Utilitários ──────────────────────────────────────────────────────────────
const levelColor = (level) => {
  const map = {
    'Mestre Ambiental': 'text-purple-400 bg-purple-400/10',
    'Guardião Verde': 'text-emerald-400 bg-emerald-400/10',
    'Eco Warrior': 'text-teal-400 bg-teal-400/10',
    'Reciclador': 'text-blue-400 bg-blue-400/10',
    'Iniciante Consciente': 'text-amber-400 bg-amber-400/10',
  };
  return map[level] || 'text-slate-400 bg-slate-400/10';
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Modal de confirmação ──────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel, danger = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
        <AlertTriangle size={22} className={danger ? 'text-red-400' : 'text-amber-400'} />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition-colors">Cancelar</button>
        <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors text-white ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-500 hover:bg-amber-400'}`}>Confirmar</button>
      </div>
    </motion.div>
  </div>
);

// ── Modal editar pontos ───────────────────────────────────────────────────────
const EditPointsModal = ({ user, onSave, onCancel }) => {
  const [value, setValue] = useState(String(user.ecoPoints || 0));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const pts = parseInt(value, 10);
    if (isNaN(pts) || pts < 0) return;
    setLoading(true);
    await onSave(user.id, pts);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Editar EcoPoints</h3>
            <p className="text-slate-500 text-xs">{user.name || user.email}</p>
          </div>
          <button onClick={onCancel} className="ml-auto text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quantidade de EcoPoints</label>
        <input
          type="number" min="0" value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 mb-6"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Modal criar usuário ───────────────────────────────────────────────────────
const CreateUserModal = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name || !email || !password) { setError('Preencha todos os campos.'); return; }
    if (password.length < 6) { setError('Senha precisa ter ao menos 6 caracteres.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave(email, password, name);
    } catch (e) {
      setError(e.message || 'Erro ao criar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-eco-500/10 flex items-center justify-center">
            <UserPlus size={18} className="text-eco-400" />
          </div>
          <h3 className="text-white font-bold">Criar Novo Usuário</h3>
          <button onClick={onCancel} className="ml-auto text-slate-500 hover:text-slate-300"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {['Nome', 'Email', 'Senha'].map((label, i) => (
            <div key={label}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
              <input
                type={i === 2 ? 'password' : i === 1 ? 'email' : 'text'}
                value={i === 0 ? name : i === 1 ? email : password}
                onChange={(e) => [setName, setEmail, setPassword][i](e.target.value)}
                placeholder={['Ex.: João Silva', 'joao@email.com', 'Mín. 6 caracteres'][i]}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-eco-500/40"
              />
            </div>
          ))}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-eco-600 hover:bg-eco-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Criar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Linha de usuário ──────────────────────────────────────────────────────────
const UserRow = ({ user, onEditPoints, onToggleAdmin, onDelete, currentUserId }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrentUser = user.id === currentUserId;

  return (
    <motion.tr
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group"
    >
      {/* Avatar + Nome */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-slate-700 flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-slate-400">{(user.name || user.email || '?')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white truncate max-w-[140px]">{user.name || '—'}</span>
              {user.isAdmin && <Crown size={12} className="text-amber-400 shrink-0" />}
              {isCurrentUser && <span className="text-[10px] font-bold bg-eco-500/20 text-eco-400 px-1.5 py-0.5 rounded-full">Você</span>}
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[180px]">{user.email}</p>
          </div>
        </div>
      </td>

      {/* EcoPoints */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-400" />
          <span className="text-sm font-bold text-amber-400">{(user.ecoPoints || 0).toLocaleString()}</span>
        </div>
      </td>

      {/* Nível */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${levelColor(user.level)}`}>
          {user.level || 'Iniciante'}
        </span>
      </td>

      {/* Admin */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${user.isAdmin ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/50 text-slate-500'}`}>
          {user.isAdmin ? 'Admin' : 'Usuário'}
        </span>
      </td>

      {/* Cadastro */}
      <td className="px-4 py-3.5 hidden xl:table-cell">
        <span className="text-xs text-slate-500">{fmt(user.createdAt)}</span>
      </td>

      {/* Ações */}
      <td className="px-4 py-3.5 relative">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditPoints(user)}
            className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-colors"
            title="Editar EcoPoints"
          >
            <Edit3 size={15} />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
            >
              <MoreVertical size={15} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 w-48 overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => { onToggleAdmin(user); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Crown size={14} className="text-amber-400" />
                    {user.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                  </button>
                  {!isCurrentUser && (
                    <button
                      onClick={() => { onDelete(user); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                    >
                      <Trash2 size={14} />
                      Excluir usuário
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </motion.tr>
  );
};

// ── AdminDashboard principal ──────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const [usersData, statsData] = await Promise.all([
        adminGetAllUsers(),
        adminGetStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (e) {
      showToast('Erro ao carregar dados.', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtro + busca
  const filtered = users.filter((u) => {
    const matchSearch = search === '' ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'admin' && u.isAdmin) ||
      (filter === 'user' && !u.isAdmin);
    return matchSearch && matchFilter;
  });

  // Handlers
  const handleEditPoints = async (userId, points) => {
    await adminSetEcoPoints(userId, points);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ecoPoints: points } : u));
    setEditUser(null);
    showToast('EcoPoints atualizados com sucesso!');
  };

  const handleToggleAdmin = async (targetUser) => {
    await adminToggleAdmin(targetUser.id, !targetUser.isAdmin);
    setUsers((prev) => prev.map((u) => u.id === targetUser.id ? { ...u, isAdmin: !u.isAdmin } : u));
    setConfirmAdmin(null);
    showToast(`${targetUser.name} ${!targetUser.isAdmin ? 'agora é admin' : 'não é mais admin'}.`);
  };

  const handleDelete = async (targetUser) => {
    await adminDeleteUser(targetUser.id);
    setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    setConfirmDelete(null);
    showToast(`Usuário ${targetUser.name} excluído.`, 'error');
  };

  const handleCreateUser = async (email, password, name) => {
    await adminCreateUser(email, password, name);
    setShowCreate(false);
    showToast(`Usuário ${name} criado com sucesso!`);
    loadData();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const statCards = [
    { label: 'Usuários', value: stats?.totalUsers ?? '—', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Classificações', value: stats?.totalClassifications ?? '—', icon: Database, color: 'from-eco-500 to-teal-600' },
    { label: 'Ações de Jogo', value: stats?.totalGameActions ?? '—', icon: TrendingUp, color: 'from-purple-500 to-indigo-600' },
    { label: 'EcoPoints Total', value: stats?.totalPoints?.toLocaleString() ?? '—', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Modais */}
      {editUser && <EditPointsModal user={editUser} onSave={handleEditPoints} onCancel={() => setEditUser(null)} />}
      {showCreate && <CreateUserModal onSave={handleCreateUser} onCancel={() => setShowCreate(false)} />}
      {confirmDelete && (
        <ConfirmModal
          danger
          title="Excluir usuário"
          message={`Deseja remover "${confirmDelete.name || confirmDelete.email}"? Esta ação não pode ser desfeita.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmAdmin && (
        <ConfirmModal
          title={confirmAdmin.isAdmin ? 'Remover privilégios admin' : 'Conceder privilégios admin'}
          message={`Deseja ${confirmAdmin.isAdmin ? 'remover' : 'conceder'} privilégios de admin para "${confirmAdmin.name}"?`}
          onConfirm={() => handleToggleAdmin(confirmAdmin)}
          onCancel={() => setConfirmAdmin(null)}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-semibold ${toast.type === 'error' ? 'bg-red-600' : 'bg-eco-600'}`}
          >
            {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              App
            </button>
            <div className="w-px h-5 bg-slate-700" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="font-black text-white tracking-tight">EcoSphere <span className="text-red-400">Admin</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl">
              <Crown size={13} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">{user?.name || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-sm font-medium rounded-xl transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Painel de Administração</h1>
          <p className="text-slate-500 mt-1">Gerencie usuários, permissões e EcoPoints da plataforma.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabela */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-eco-500/40"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'admin', 'user'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-eco-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {f === 'all' ? 'Todos' : f === 'admin' ? 'Admins' : 'Usuários'}
                </button>
              ))}
              <button onClick={loadData} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Atualizar">
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-eco-600 hover:bg-eco-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus size={14} />
                Novo usuário
              </button>
            </div>
          </div>

          {/* Tabela */}
          {loadingUsers ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-eco-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Users size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Usuário', 'EcoPoints', 'Nível', 'Perfil', 'Cadastro', 'Ações'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      currentUserId={user?.id}
                      onEditPoints={setEditUser}
                      onToggleAdmin={setConfirmAdmin}
                      onDelete={setConfirmDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loadingUsers && (
            <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">{filtered.length} de {users.length} usuários</span>
              <span className="text-xs text-slate-600">EcoSphere Admin Panel</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
