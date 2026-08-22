import React from 'react';
import { Check, Circle } from 'lucide-react';
import { NEXT_STEPS } from './constants';

const CarbonChecklist = () => (
  <ul className="space-y-3">
    {NEXT_STEPS.map((step) => (
      <li
        key={step.id}
        className={`flex items-center gap-3 text-sm ${step.active ? 'text-stone-800' : 'text-stone-400 opacity-70'}`}
      >
        {step.active ? (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-eco-100 border border-eco-200">
            <Check size={12} className="text-eco-600" />
          </span>
        ) : (
          <Circle size={18} className="text-stone-300 shrink-0" />
        )}
        <span className={step.active ? 'font-medium' : ''}>{step.label}</span>
      </li>
    ))}
  </ul>
);

export default CarbonChecklist;
