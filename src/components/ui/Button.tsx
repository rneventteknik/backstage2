import React from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'outline-primary' | 'secondary' | 'success' | 'danger' | 'none';
    as?: 'button' | 'a' | 'span';
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    disabled?: boolean;
};

const variantStyleClasses = {
    primary: 'bg-blue-500 text-white',
    'outline-primary': 'border border-blue-500 text-blue-500',
    secondary: 'bg-gray-700 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    none: '',
    '': 'bg-gray-500 text-white',
};

export const Button: React.FC<Props> = ({ children, className, onClick, variant, as, type, href, disabled}: Props) => {
    const buttonClassName = 'shadow-md rounded px-4 pt-2 pb-2 mb-4 text-opacity-70 hover:text-opacity-100 duration-100 ' + variantStyleClasses[variant ?? ''] + className;

    if (as === 'a') {
        return (
            <a className={buttonClassName} onClick={onClick} href={href}>
                {children}
            </a>
        );
    }

    if (as === 'span') {
        return (
            <span className={buttonClassName} onClick={onClick}>
                {children}
            </span>
        );
    }

    return (
        <button onClick={onClick} className={buttonClassName} type={type} disabled={disabled}>
            {children}
        </button>
    );
};