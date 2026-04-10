import React from 'react';

interface InputGroupProps {
    className?: string;
    children: React.ReactNode;
    hasValidation?: boolean;
}

const InputGroupRoot: React.FC<InputGroupProps> = ({ className = '', children }) => (
    <div className={`flex items-stretch ${className}`}>{children}</div>
);

const InputGroupText: React.FC<{ className?: string; children: React.ReactNode }> = ({
    className = '',
    children,
}) => (
    <span
        className={`inline-flex items-center px-3 bg-bs-6 border border-bs-4 text-body text-sm whitespace-nowrap ${className}`}
    >
        {children}
    </span>
);

export const InputGroup = Object.assign(InputGroupRoot, {
    Text: InputGroupText,
});
