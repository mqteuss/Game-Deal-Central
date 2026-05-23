import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownUp, Check, ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 transition-all w-[190px] group border ${
          isOpen 
            ? 'bg-zinc-800 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
            : 'bg-zinc-900/80 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/80'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 text-zinc-200 group-hover:text-white transition-colors">
          <ArrowDownUp size={15} className="text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown 
          size={15} 
          className={`text-zinc-500 group-hover:text-zinc-300 transition-all duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-60 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/60 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden transform origin-top-left sm:origin-top-right"
            role="listbox"
          >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-white/5">
              <span className="text-[11px] uppercase tracking-widest font-semibold text-zinc-500">Ordenar por</span>
            </div>

            <div className="py-1.5 max-h-[60vh] overflow-y-auto overscroll-contain">
              {options.map((option, index) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150 ${
                      isSelected 
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white hover:pl-5'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
                      >
                        <Check size={15} className="text-emerald-400" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
