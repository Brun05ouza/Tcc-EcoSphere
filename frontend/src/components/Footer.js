import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-green-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 mb-4"
            >
              <span className="text-3xl">🌍</span>
              <span className="text-2xl font-bold">EcoSphere</span>
            </motion.div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Transformando dados em ação sustentável através de inteligência artificial e participação comunitária.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.2, y: -2 }}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <i className={`bi bi-${social} text-sm`}></i>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/monitoramento', label: 'Monitoramento' },
                { to: '/classificar-residuos', label: 'IA Resíduos' },
                { to: '/gamificacao', label: 'EcoPoints' },
                { to: '/recompensas', label: 'Recompensas' }
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <i className="bi bi-chevron-right text-xs"></i>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm">
              {[
                'Educação Ambiental',
                'Relatórios',
                'API Pública',
                'Suporte'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                    <i className="bi bi-chevron-right text-xs"></i>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <i className="bi bi-envelope"></i>
                <span>contato@ecosphere.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="bi bi-telephone"></i>
                <span>(11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <i className="bi bi-geo-alt"></i>
                <span>São Paulo, Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 EcoSphere. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;