import React from 'react';

type AlertVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

interface AlertProps {
    variant?: AlertVariant;
    className?: string;
    children: React.ReactNode;
    onClose?: () => void;
}

const variants: Record<AlertVariant, string> = {
    primary: 'bg-primary/20 border-primary/40 text-body',
    secondary: 'bg-bs-4 border-bs-6 text-body',
    success: 'bg-success/20 border-success/40 text-body',
    danger: 'bg-danger/20 border-danger/40 text-body',
    warning: 'bg-warning/20 border-warning/40 text-body',
    info: 'bg-info/20 border-info/40 text-body',
    light: 'bg-bs-5 border-bs-7 text-body',
    dark: 'bg-bs-2 border-bs-4 text-body',
};

export const Alert: React.FC<AlertProps> = ({ variant = 'primary', className = '', children, onClose }) => (
    <div
        role="alert"
        className={`relative border px-4 py-3 ${variants[variant]} ${className}`}
    >
        {onClose && (
            <button
                onClick={onClose}
                className="absolute top-2 right-3 text-muted hover:text-body"
                aria-label="Close"
            >
                ×
            </button>
        )}
        {children}
    </div>
);
