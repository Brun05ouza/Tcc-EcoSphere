import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import EcoGlobeLogo from './ui/EcoGlobeLogo';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <EcoGlobeLogo size={48} style={{ filter: 'brightness(0) invert(1)' }} />
              <span className="text-xl font-bold text-white font-display">EcoSphere</span>
            </motion.div>
            <p className="text-sm leading-relaxed mb-6 text-stone-400">
              Transformando dados em ação sustentável através de inteligência artificial e participação comunitária.
            </p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center hover:bg-eco-600 transition-colors text-stone-400 hover:text-white"
                >
                  <i className={`bi bi-${social} text-sm`}></i>
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Navegação</h3>
            <ul className="space-y-3 text-sm">
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
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-stone-400 hover:text-eco-400 transition-colors flex items-center gap-2"
                  >
                    <span className="text-eco-500/60">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contato</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 text-stone-400">
                <Mail size={18} className="text-eco-500/70 shrink-0 mt-0.5" />
                <span>brunosoaresecosphere@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-stone-400">
                <Phone size={18} className="text-eco-500/70 shrink-0" />
                <span>(21) 96527-2231</span>
              </div>
              <div className="flex items-center gap-3 text-stone-400">
                <MapPin size={18} className="text-eco-500/70 shrink-0" />
                <span>Rio de Janeiro, Brasil</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
            <p>© 2024 EcoSphere. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-eco-400 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-eco-400 transition-colors">Termos</a>
              <a href="#" className="hover:text-eco-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
