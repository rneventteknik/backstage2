import React from 'react';

interface ListGroupProps {
    className?: string;
    children: React.ReactNode;
    variant?: 'flush';
}

const ListGroupRoot: React.FC<ListGroupProps> = ({ className = '', variant, children }) => (
    <div className={`border border-bs-2 divide-y divide-bs-2 ${variant === 'flush' ? 'border-x-0 border-t-0' : ''} ${className}`}>
        {children}
    </div>
);

interface ListGroupItemProps {
    className?: string;
    children: React.ReactNode;
    active?: boolean;
    action?: boolean;
    href?: string;
    onClick?: () => void;
    as?: React.ElementType;
}

const ListGroupItem: React.FC<ListGroupItemProps> = ({
    className = '',
    active,
    action,
    href,
    onClick,
    children,
}) => {
    const base = `block px-5 py-3 text-sm text-body bg-bs-1`;
    const activeClass = active ? 'bg-primary text-white' : '';
    const hoverClass = action || href || onClick ? 'cursor-pointer hover:bg-bs-2 transition-colors' : '';
    const combined = `${base} ${activeClass} ${hoverClass} ${className}`;

    if (href) return <a href={href} className={combined}>{children}</a>;
    if (onClick) return <button type="button" onClick={onClick} className={`w-full text-left ${combined}`}>{children}</button>;
    return <div className={combined}>{children}</div>;
};

export const ListGroup = Object.assign(ListGroupRoot, {
    Item: ListGroupItem,
});
