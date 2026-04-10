import React from 'react';

type BgVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    bg?: BgVariant;
    variant?: BgVariant;
}

const bgs: Record<BgVariant, string> = {
    primary: 'bg-primary text-white',
    secondary: 'bg-bs-5 text-body',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    warning: 'bg-warning text-black',
    info: 'bg-info text-black',
    light: 'bg-bs-7 text-body',
    dark: 'bg-bs-2 text-body',
};

export const Badge: React.FC<BadgeProps> = ({ bg, variant, className = '', children, ...rest }) => {
    const key = variant ?? bg ?? 'primary';
    return (
        <span
            className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-sm ${bgs[key]} ${className}`}
            {...rest}
        >
            {children}
        </span>
    );
};
