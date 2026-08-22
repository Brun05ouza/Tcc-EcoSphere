import React from 'react';
import { Loader2 } from 'lucide-react';
import CarbonSelect, { carbonFieldClassName } from './CarbonSelect';
import CarbonDatePicker from './CarbonDatePicker';

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
  hideLabel = false,
  loading = false,
  onBlur,
  readOnly = false,
  error,
}) => {
  const renderInput = () => {
    if (type === 'select') {
      return (
        <CarbonSelect
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          options={options}
        />
      );
    }

    if (type === 'date') {
      return (
        <CarbonDatePicker
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
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
          readOnly={readOnly}
          className={`${carbonFieldClassName} resize-y min-h-[100px] cursor-text`}
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
        onBlur={onBlur}
        placeholder={placeholder}
        step={step}
        min={min}
        readOnly={readOnly}
        className={`${carbonFieldClassName} cursor-text ${suffix || loading ? 'pr-12' : ''} ${readOnly ? 'bg-stone-50 text-stone-600 cursor-default' : ''}`}
      />
    );

    if (suffix || loading) {
      return (
        <div className="relative">
          {inputEl}
          {loading ? (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-eco-600">
              <Loader2 size={18} className="animate-spin" />
            </span>
          ) : (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400">
              {suffix}
            </span>
          )}
        </div>
      );
    }

    return inputEl;
  };

  return (
    <div>
      {!hideLabel && label && (
        <label htmlFor={name} className={labelClassName}>{label}</label>
      )}
      {renderInput()}
      {helperText && (
        <p className={`mt-1.5 text-xs leading-relaxed ${error ? 'text-red-500' : 'text-stone-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default CarbonFormField;
