'use client';

import * as React from 'react';
import { X, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    allowCustom?: boolean;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select items...',
    className = '',
    allowCustom = true,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item));
    };

    const handleSelect = (item: string) => {
        if (selected.includes(item)) {
            handleUnselect(item);
        } else {
            onChange([...selected, item]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (allowCustom && !selected.includes(inputValue.trim())) {
                handleSelect(inputValue.trim());
                setInputValue('');
            } else if (options.includes(inputValue.trim()) && !selected.includes(inputValue.trim())) {
                handleSelect(inputValue.trim());
                setInputValue('');
            }
        }
        if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
            handleUnselect(selected[selected.length - 1]);
        }
    };

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                className="min-h-[46px] w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:ring-offset-2 focus-within:ring-offset-transparent cursor-text transition-all"
                onClick={() => setOpen(true)}
            >
                <div className="flex flex-wrap gap-2">
                    {selected.map((item) => (
                        <Badge
                            key={item}
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 border-purple-500/30 px-2 py-1 rounded-md flex items-center gap-1"
                        >
                            {item}
                            <button
                                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUnselect(item);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleUnselect(item);
                                }}
                            >
                                <X className="h-3 w-3 hover:text-white transition-colors" />
                            </button>
                        </Badge>
                    ))}
                    <input
                        className="flex-1 bg-transparent outline-none placeholder:text-gray-500 min-w-[120px] text-white"
                        placeholder={selected.length === 0 ? placeholder : ''}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                    />
                </div>
                <div className="absolute right-3 top-3 opacity-50 pointer-events-none">
                    <ChevronsUpDown className="h-4 w-4" />
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 z-50 w-full rounded-xl border border-white/20 bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-auto p-1 py-2 custom-scrollbar">
                            {filteredOptions.length === 0 && !inputValue && (
                                <div className="px-4 py-2 text-sm text-gray-500 text-center">No options found.</div>
                            )}

                            {filteredOptions.map((option) => (
                                <div
                                    key={option}
                                    onClick={() => {
                                        handleSelect(option);
                                        setInputValue('');
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${selected.includes(option)
                                            ? 'bg-purple-500/20 text-purple-100'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <div className={`w-4 h-4 flex items-center justify-center border rounded ${selected.includes(option) ? 'border-purple-500 bg-purple-500' : 'border-gray-500'}`}>
                                        {selected.includes(option) && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    {option}
                                </div>
                            ))}

                            {allowCustom && inputValue && !filteredOptions.includes(inputValue) && !selected.includes(inputValue) && (
                                <div
                                    onClick={() => {
                                        handleSelect(inputValue);
                                        setInputValue('');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg cursor-pointer text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add "{inputValue}"
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
