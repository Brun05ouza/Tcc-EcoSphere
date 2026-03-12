import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { gamificationAPI, userAPI } from '../services/api';
import { FileText, Settings, Lock, Save, Camera, Loader2 } from 'lucide-react';
import { AppIcon } from '../components/ui/AppIcon';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    state: '',
    bio: '',
    interests: []
  });
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user: contextUser, updateUser } = useUser();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        birthDate: parsedUser.birthDate || '',
        city: parsedUser.city || '',
        state: parsedUser.state || '',
        bio: parsedUser.bio || '',
        interests: parsedUser.interests || []
      });
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const res = await gamificationAPI.getProfile();
      const d = res.data || {};
      setStats({
        ecoPoints: d.ecoPoints ?? userData.ecoPoints ?? 0,
        level: d.level || userData.level || 'Iniciante',
        badges: (d.badges || []).length,
        classifications: d.totalClassifications ?? 0,
      });
    } catch {
      setStats({
        ecoPoints: userData.ecoPoints || 0,
        level: userData.level || 'Iniciante',
        badges: 0,
        classifications: 0,
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInterestToggle = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData({
      ...formData,
      interests: newInterests
    });
  };

  const handleSave = async () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    updateUser(updatedUser);
    try {
      await userAPI.updateProfile({ name: formData.name, email: formData.email });
      alert('Perfil atualizado com sucesso!');
    } catch (e) {
      alert('Perfil salvo localmente. Erro ao sincronizar com o servidor.');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await userAPI.uploadAvatar(file);
      const updatedProfile = response.data;
      
      const updatedUser = { ...user, ...updatedProfile };
      setUser(updatedUser);
      updateUser(updatedUser);
      
      alert('Foto de perfil atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
      alert('Erro ao atualizar foto de perfil. Tente novamente mais tarde.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const interests = [
    'Reciclagem', 'Energia Solar', 'Compostagem', 'Mobilidade Sustentável',
    'Agricultura Orgânica', 'Conservação da Água', 'Vida Selvagem', 'Mudanças Climáticas'
  ];

  return (
    <div className="min-h-screen bg-surface-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <AppIcon name="user" size={20} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight">
                Meu Perfil
              </h1>
            </div>
            <p className="text-stone-500 ml-13 flex items-center gap-2">
              <span>Gerencie suas informações e preferências</span>
            </p>
          </div>
          
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-stone-600">Sincronizado</span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { label: 'EcoPoints', value: stats.ecoPoints || 0, iconName: 'star', color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-200' },
            { label: 'Nível', value: stats.level || 'Iniciante', iconName: 'trophy', color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
            { label: 'Badges', value: stats.badges || 0, iconName: 'award', color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-200' },
            { label: 'Classificações', value: stats.classifications || 0, iconName: 'bot', color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-200' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white p-6 rounded-3xl shadow-soft border border-stone-100 transition-all duration-300 ${stat.border} hover:shadow-lg group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  <AppIcon name={stat.iconName} size={24} className={stat.color} />
                </div>
              </div>
              <div className="text-sm font-semibold text-stone-500 mb-1">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-row flex-wrap gap-2 bg-stone-100/80 p-2 rounded-2xl border border-stone-200 backdrop-blur w-full max-w-full overflow-x-auto custom-scrollbar md:w-auto md:justify-center">
            {[
              { id: 'personal', label: 'Dados Pessoais', icon: 'bi-person', activeColor: 'text-indigo-500' },
              { id: 'preferences', label: 'Preferências', icon: 'bi-gear', activeColor: 'text-indigo-500' },
              { id: 'security', label: 'Segurança', icon: 'bi-shield-check', activeColor: 'text-indigo-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-white/50 border border-transparent'
                }`}
              >
                <i className={`${tab.icon} ${activeTab === tab.id ? tab.activeColor : 'text-stone-400'}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-soft border border-stone-100 p-6 md:p-8"
        >
          {activeTab === 'personal' && (
            <div>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-stone-800">Informações Pessoais</h2>
              </div>

              {/* Profile Picture Upload Section */}
              <div className="mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-stone-50/50 p-6 rounded-3xl border border-stone-100">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
                <div 
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center relative">
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                      </div>
                    )}
                    {(user?.avatar_url || user?.picture || user?.avatar) ? (
                      <img src={user.avatar_url || user.picture || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <AppIcon name="user" size={40} className="text-stone-300" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-stone-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-stone-100 text-stone-500 group-hover:text-indigo-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-sm font-bold text-stone-800 mb-1">Foto de Perfil</h3>
                  <p className="text-sm text-stone-500 mb-4 max-w-md">
                    Recomendamos uma imagem quadrada de no mínimo 200x200px. Formatos suportados: JPG, PNG ou WebP.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-white border border-stone-200 hover:border-indigo-200 hover:bg-indigo-50 text-stone-600 hover:text-indigo-600 text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Enviando...' : 'Alterar Foto'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="São Paulo"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Estado</label>
                  <div className="relative">
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none appearance-none"
                    >
                      <option value="">Selecione</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="PR">Paraná</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Biografia</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Conte um pouco sobre você e seus interesses ambientais..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-stone-800">Preferências</h2>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 mb-4">Interesses Ambientais</h3>
                  <div className="flex flex-wrap gap-3">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                          formData.interests.includes(interest)
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-indigo-200 hover:bg-stone-50'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-stone-800 mb-4">Notificações</h3>
                  <div className="space-y-3 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                      <span className="ml-3 text-stone-600 font-medium group-hover:text-stone-800 transition-colors">Receber notificações de novos desafios</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
                      <span className="ml-3 text-stone-600 font-medium group-hover:text-stone-800 transition-colors">Alertas de ranking</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-3 text-stone-600 font-medium group-hover:text-stone-800 transition-colors">Newsletter semanal</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-stone-800">Segurança</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Senha Atual</label>
                  <input
                    type="password"
                    placeholder="Digite sua senha atual"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Digite a nova senha"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Confirme a nova senha"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 outline-none"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                  <h4 className="font-bold text-amber-800 mb-3">Dicas de Segurança:</h4>
                  <ul className="text-sm text-amber-700 space-y-2 font-medium">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Use pelo menos 8 caracteres</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Inclua letras maiúsculas e minúsculas</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Adicione números e símbolos</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> Evite informações pessoais</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-10 pt-8 border-t border-stone-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Save size={20} />
              Salvar Alterações
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;