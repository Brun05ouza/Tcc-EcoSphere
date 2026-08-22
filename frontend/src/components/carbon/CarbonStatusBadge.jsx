import React from 'react';
import { Shield } from 'lucide-react';

const CarbonStatusBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-eco-50 text-eco-700 border border-eco-200">
    <Shield size={12} />
    MRV Digital
  </span>
);

export default CarbonStatusBadge;
