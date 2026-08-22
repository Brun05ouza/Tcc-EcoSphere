import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export const carbonFieldClassName =
  'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 caret-stone-800 transition-colors outline-none focus:border-eco-400 focus:ring-2 focus:ring-eco-500/20 [color-scheme:light]';

function useDropdownPosition(open, anchorRef) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 240 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    const viewportPadding = 12;
    const preferredMaxHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;
    const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      120,
      Math.min(preferredMaxHeight, openUpward ? spaceAbove : spaceBelow),
    );

    setPosition({
      top: openUpward ? rect.top - gap - maxHeight : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return undefined;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  return position;
}

const CarbonSelect = ({
  name,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const position = useDropdownPosition(open, containerRef);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      if (event.target.closest('[data-carbon-select-menu]')) return;
      setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setOpen(false);
  };

  const dropdown = open && createPortal(
    <ul
      role="listbox"
      data-carbon-select-menu
      data-lenis-prevent
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        zIndex: 9999,
      }}
      className="carbon-dropdown-scroll overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white py-1 shadow-soft-lg"
      onWheel={(event) => event.stopPropagation()}
    >
      {options.map((option) => {
        const selected = value === option;
        return (
          <li key={option} role="option" aria-selected={selected}>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(option)}
              className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                selected
                  ? 'bg-eco-50 font-medium text-eco-700'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{option}</span>
              {selected && <Check size={16} className="text-eco-600" />}
            </button>
          </li>
        );
      })}
    </ul>,
    document.body,
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`${carbonFieldClassName} cursor-pointer flex items-center justify-between gap-2 text-left ${!value ? 'text-stone-400' : ''}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {dropdown}
    </div>
  );
};

export default CarbonSelect;
