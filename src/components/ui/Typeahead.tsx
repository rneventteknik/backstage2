'use client';
import React, { useState, useRef, useEffect } from 'react';

type LabelKey<T> = keyof T | ((option: T) => string);

function getLabel<T>(option: T, labelKey?: LabelKey<T>): string {
    if (!labelKey) return String(option);
    if (typeof labelKey === 'function') return labelKey(option);
    return String((option as Record<string, unknown>)[labelKey as string] ?? option);
}

export interface TypeaheadProps<T extends object = Record<string, unknown>> {
    id: string;
    options: T[];
    selected?: T[];
    defaultSelected?: T[];
    onChange?: (selected: T[]) => void;
    labelKey?: LabelKey<T>;
    placeholder?: string;
    multiple?: boolean;
    disabled?: boolean;
    defaultInputValue?: string;
    /** Custom render for each dropdown option */
    renderMenuItemChildren?: (option: T, props: unknown, index: number) => React.ReactNode;
    className?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    minLength?: number;
    onInputChange?: (text: string) => void;
    isLoading?: boolean;
    /** reset after selection (used by some search UIs) */
    clearButton?: boolean;
}

export function Typeahead<T extends object = Record<string, unknown>>({
    id,
    options,
    selected: selectedProp,
    defaultSelected,
    onChange,
    labelKey,
    placeholder = '',
    multiple = false,
    disabled = false,
    defaultInputValue = '',
    renderMenuItemChildren,
    className = '',
    inputProps,
    onInputChange,
    isLoading,
}: TypeaheadProps<T>) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selected = React.useMemo(() => selectedProp ?? defaultSelected ?? [], [selectedProp, defaultSelected]);
    const [query, setQuery] = useState(defaultInputValue);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Single-select: sync input text with selected[0]
    useEffect(() => {
        if (!multiple && selected.length > 0 && !open) {
            setQuery(getLabel(selected[0], labelKey));
        }
    }, [selected, labelKey, multiple, open]);

    const filtered = options.filter((opt) => {
        const label = getLabel(opt, labelKey).toLowerCase();
        return label.includes(query.toLowerCase());
    });

    const handleSelect = (opt: T) => {
        if (multiple) {
            const already = selected.some((s) => getLabel(s, labelKey) === getLabel(opt, labelKey));
            const next = already ? selected.filter((s) => getLabel(s, labelKey) !== getLabel(opt, labelKey)) : [...selected, opt];
            onChange?.(next);
        } else {
            onChange?.([opt]);
            setQuery(getLabel(opt, labelKey));
            setOpen(false);
        }
    };

    const removeToken = (opt: T) => {
        onChange?.(selected.filter((s) => getLabel(s, labelKey) !== getLabel(opt, labelKey)));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(filtered[activeIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const inputBase =
        'bg-bs-4 border border-bs-4 text-body placeholder-muted px-3 py-1.5 text-sm focus:outline-none focus:border-bs-7 disabled:opacity-60 w-full';

    return (
        <div ref={containerRef} className={`relative ${className}`} id={id}>
            {/* Multi-select tokens */}
            {multiple && selected.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {selected.map((opt, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-bs-5 text-body text-xs"
                        >
                            {getLabel(opt, labelKey)}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeToken(opt)}
                                    className="text-muted hover:text-body leading-none"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <input
                ref={inputRef}
                id={`${id}-input`}
                type="text"
                value={query}
                disabled={disabled}
                placeholder={placeholder}
                className={inputBase}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActiveIndex(-1);
                    onInputChange?.(e.target.value);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                {...inputProps}
            />

            {/* Dropdown */}
            {open && (
                <ul className="absolute z-50 w-full bg-bs-3 border border-bs-6 shadow-lg max-h-60 overflow-y-auto mt-0.5">
                    {isLoading && (
                        <li className="px-4 py-2 text-sm text-muted">Laddar...</li>
                    )}
                    {!isLoading && filtered.length === 0 && (
                        <li className="px-4 py-2 text-sm text-muted">Inga alternativ</li>
                    )}
                    {!isLoading &&
                        filtered.map((opt, i) => {
                            const isSelected = multiple && selected.some((s) => getLabel(s, labelKey) === getLabel(opt, labelKey));
                            return (
                                <li
                                    key={i}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelect(opt)}
                                    className={`px-4 py-1.5 text-sm cursor-pointer select-none transition-colors
                                        ${i === activeIndex ? 'bg-bs-4' : 'hover:bg-bs-4'}
                                        ${isSelected ? 'text-primary' : 'text-body'}
                                    `}
                                >
                                    {renderMenuItemChildren
                                        ? renderMenuItemChildren(opt, {}, i)
                                        : getLabel(opt, labelKey)}
                                </li>
                            );
                        })}
                </ul>
            )}
        </div>
    );
}
