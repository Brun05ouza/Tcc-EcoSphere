import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { carbonFieldClassName } from './CarbonSelect';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatIsoToDisplay(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

export function parseDisplayToIso(value) {
  const match = String(value).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${pad(month)}-${pad(day)}`;
}

function isoToDate(iso) {
  if (!iso) return new Date();
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIso(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function useCalendarPosition(open, anchorRef) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 280 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    const calendarHeight = 340;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const openUpward = spaceBelow < calendarHeight && rect.top > calendarHeight;

    setPosition({
      top: openUpward ? rect.top - gap - calendarHeight : rect.bottom + gap,
      left: Math.min(rect.left, window.innerWidth - 300 - 12),
      width: Math.max(rect.width, 280),
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

const CarbonDatePicker = ({
  name,
  id,
  value,
  onChange,
  placeholder = 'Selecione a data',
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatIsoToDisplay(value));
  const [viewDate, setViewDate] = useState(isoToDate(value));
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const calendarPosition = useCalendarPosition(open, containerRef);

  useEffect(() => {
    setInputValue(formatIsoToDisplay(value));
    if (value) setViewDate(isoToDate(value));
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      if (event.target.closest('[data-carbon-date-calendar]')) return;
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

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    for (let index = startOffset - 1; index >= 0; index -= 1) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - index),
        outside: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(year, month, day),
        outside: false,
      });
    }

    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (startOffset + daysInMonth) + 1;
      cells.push({
        date: new Date(year, month + 1, nextDay),
        outside: true,
      });
    }

    return cells;
  }, [viewDate]);

  const selectedDate = value ? isoToDate(value) : null;
  const today = new Date();

  const commitIso = (iso) => {
    onChange({ target: { name, value: iso } });
    setInputValue(formatIsoToDisplay(iso));
    if (iso) setViewDate(isoToDate(iso));
  };

  const handleInputBlur = () => {
    window.setTimeout(() => {
      if (document.activeElement === inputRef.current) return;
      if (document.activeElement?.closest('[data-carbon-date-calendar]')) return;

      if (!inputValue.trim()) {
        commitIso('');
        return;
      }

      const iso = parseDisplayToIso(inputValue);
      if (iso) {
        commitIso(iso);
        return;
      }

      setInputValue(formatIsoToDisplay(value));
    }, 0);
  };

  const handleSelectDay = (date) => {
    commitIso(toIso(date));
    setOpen(false);
    inputRef.current?.focus();
  };

  const calendar = open && createPortal(
    <div
      data-carbon-date-calendar
      data-lenis-prevent
      style={{
        position: 'fixed',
        top: calendarPosition.top,
        left: calendarPosition.left,
        width: calendarPosition.width,
        zIndex: 9999,
      }}
      className="min-w-[280px] rounded-2xl border border-stone-200 bg-white p-4 shadow-soft-lg"
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-bold text-stone-800">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </p>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            className="py-1 text-center text-[11px] font-bold uppercase tracking-wide text-stone-400"
          >
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, outside }) => {
          const selected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${outside ? 'o' : 'i'}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelectDay(date)}
              className={`h-9 cursor-pointer rounded-lg text-sm transition-colors ${
                selected
                  ? 'bg-eco-600 font-bold text-white shadow-sm shadow-eco-500/30'
                  : outside
                  ? 'text-stone-300 hover:bg-stone-50 hover:text-stone-500'
                  : isToday
                  ? 'border border-eco-300 font-semibold text-eco-700 hover:bg-eco-50'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={inputValue}
          placeholder={placeholder}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={handleInputBlur}
          className={`${carbonFieldClassName} pr-12`}
          inputMode="numeric"
          autoComplete="off"
        />
        <button
          type="button"
          aria-label="Abrir calendário"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-eco-600"
        >
          <Calendar size={18} />
        </button>
      </div>
      {calendar}
    </div>
  );
};

export default CarbonDatePicker;
