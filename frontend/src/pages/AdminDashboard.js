import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Shield, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useUser();

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="section-container py-12">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-stone-600 hover:text-eco-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao app
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 rounded-lg text-sm font-medium transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-eco-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-eco-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-800">Painel Admin</h1>
              <p className="text-stone-500">Bem-vindo, {user?.name || user?.email}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-soft">
            <h2 className="font-semibold text-stone-800 mb-4">Informações do admin</h2>
            <ul className="space-y-2 text-stone-600">
              <li><strong>Nome:</strong> {user?.name}</li>
              <li><strong>Email:</strong> {user?.email}</li>
              <li><strong>ID:</strong> <span className="text-xs font-mono">{user?.id}</span></li>
            </ul>
            <p className="mt-6 text-sm text-stone-500">
              Este painel é acessível apenas para usuários com is_admin=true no banco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
