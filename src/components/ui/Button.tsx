import React from 'react';

type Variant =
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-danger'
    | 'outline-success'
    | 'outline-warning'
    | 'link';

type Size = 'sm' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    as?: never;
    href?: string;
    target?: string;
    rel?: string;
}

const base =
    'inline-flex items-center justify-center cursor-pointer border transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variants: Record<Variant, string> = {
    primary: 'bg-primary border-primary text-white hover:bg-primary-hover hover:border-primary-hover',
    secondary: 'bg-bs-5 border-bs-5 text-body hover:bg-bs-6 hover:border-bs-6',
    danger: 'bg-danger border-danger text-white hover:bg-danger-hover hover:border-danger-hover',
    success: 'bg-success border-success text-white hover:opacity-90',
    warning: 'bg-warning border-warning text-black hover:opacity-90',
    info: 'bg-info border-info text-black hover:opacity-90',
    'outline-primary': 'bg-transparent border-primary text-primary hover:bg-primary hover:text-white',
    'outline-secondary': 'bg-transparent border-bs-7 text-body hover:bg-bs-4',
    'outline-danger': 'bg-transparent border-danger text-danger hover:bg-danger hover:text-white',
    'outline-success': 'bg-transparent border-success text-success hover:bg-success hover:text-white',
    'outline-warning': 'bg-transparent border-warning text-warning hover:bg-warning hover:text-black',
    link: 'bg-transparent border-transparent text-primary hover:underline p-0',
};

const sizes: Record<Size, string> = {
    sm: 'px-2 py-1 text-xs',
    lg: 'px-5 py-2 text-base',
};

const defaultSize = 'px-3 py-1.5 text-sm';

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    ({ variant = 'primary', size, className = '', children, href, target, rel, type = 'button', ...props }, ref) => {
        const sizeClass = size ? sizes[size] : defaultSize;
        const cls = `${base} ${variants[variant]} ${sizeClass} ${className}`;
        if (href) {
            return (
                <a
                    href={href}
                    target={target}
                    rel={rel}
                    className={cls}
                    ref={ref as React.Ref<HTMLAnchorElement>}
                >
                    {children}
                </a>
            );
        }
        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                type={type}
                className={cls}
                {...props}
            >
                {children}
            </button>
        );
    },
);
Button.displayName = 'Button';

export const ButtonGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => <div className={`inline-flex ${className}`}>{children}</div>;
