import React from 'react';

const fieldClassName =
  'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 transition-colors outline-none focus:border-eco-400 focus:ring-2 focus:ring-eco-500/20 [color-scheme:light]';

const labelClassName = 'block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2';

const CarbonFormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  helperText,
  options = [],
  rows = 4,
  suffix,
  step,
  min,
}) => {
  const renderInput = () => {
    if (type === 'select') {
      return (
        <select name={name} id={name} value={value} onChange={onChange} className={`${fieldClassName} cursor-pointer`}>
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${fieldClassName} resize-y min-h-[100px]`}
        />
      );
    }

    const inputEl = (
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        className={suffix ? `${fieldClassName} pr-20` : fieldClassName}
      />
    );

    if (suffix) {
      return (
        <div className="relative">
          {inputEl}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 pointer-events-none">
            {suffix}
          </span>
        </div>
      );
    }

    return inputEl;
  };

  return (
    <div>
      <label htmlFor={name} className={labelClassName}>{label}</label>
      {renderInput()}
      {helperText && (
        <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">{helperText}</p>
      )}
    </div>
  );
};

export default CarbonFormField;
