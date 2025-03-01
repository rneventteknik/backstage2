import React from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
};

const variantStyleClasses = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    '': 'bg-gray-500 text-white',
};

export const Alert: React.FC<Props> = ({ children, className, variant }: Props) => {
    const alertClassName = 'border border-gray-200 p-2 ' + variantStyleClasses[variant ?? ''] + className;

    return (
        <div className={alertClassName}>
            {children}
        </div>
    );
};