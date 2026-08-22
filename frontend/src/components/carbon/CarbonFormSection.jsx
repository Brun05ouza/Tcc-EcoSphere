import React from 'react';
import { motion } from 'framer-motion';

const CarbonFormSection = ({ title, description, index = 0, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="bg-white border border-stone-100 rounded-3xl p-6 sm:p-8 shadow-soft"
  >
    <div className="mb-6">
      <h3 className="text-lg font-bold text-stone-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-stone-500">{description}</p>
      )}
    </div>
    <div className="space-y-5">{children}</div>
  </motion.section>
);

export default CarbonFormSection;
