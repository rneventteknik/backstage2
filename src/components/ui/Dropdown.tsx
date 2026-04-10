'use client';
import React from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { Button } from './Button';

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

const menuContent =
    'z-50 min-w-[160px] bg-bs-3 border border-bs-6 shadow-lg py-1 focus:outline-none';

const itemBase =
    'flex items-center w-full px-4 py-1.5 text-sm text-body cursor-default select-none outline-none hover:bg-bs-4 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none';

interface DropdownRootProps {
    children: React.ReactNode;
    align?: 'start' | 'end';
    className?: string;
}

const DropdownRoot: React.FC<DropdownRootProps> = ({ children, className = '' }) => (
    <RadixDropdown.Root>
        <div className={`relative inline-block ${className}`}>{children}</div>
    </RadixDropdown.Root>
);

interface DropdownToggleProps {
    variant?: Variant;
    size?: 'sm' | 'lg';
    id?: string;
    className?: string;
    children?: React.ReactNode;
    split?: boolean;
    'aria-label'?: string;
}

const DropdownToggle: React.FC<DropdownToggleProps> = ({ variant = 'secondary', size, className = '', children, 'aria-label': ariaLabel }) => (
    <RadixDropdown.Trigger asChild>
        <Button variant={variant} size={size} className={className} aria-label={ariaLabel}>
            {children}
            {children && <span className="ml-1 opacity-70">▾</span>}
        </Button>
    </RadixDropdown.Trigger>
);

interface DropdownMenuProps {
    align?: 'start' | 'end';
    className?: string;
    children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ align = 'start', className = '', children }) => (
    <RadixDropdown.Portal>
        <RadixDropdown.Content align={align} className={`${menuContent} ${className}`} sideOffset={2}>
            {children}
        </RadixDropdown.Content>
    </RadixDropdown.Portal>
);

interface DropdownItemProps {
    onClick?: () => void;
    href?: string;
    target?: string;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, href, target, disabled, className = '', children }) => {
    if (href) {
        return (
            <RadixDropdown.Item asChild disabled={disabled} className={`${itemBase} ${className}`}>
                <a href={href} target={target}>{children}</a>
            </RadixDropdown.Item>
        );
    }
    return (
        <RadixDropdown.Item
            onSelect={onClick ? () => onClick() : undefined}
            disabled={disabled}
            className={`${itemBase} ${className}`}
        >
            {children}
        </RadixDropdown.Item>
    );
};

const DropdownDivider: React.FC = () => (
    <RadixDropdown.Separator className="my-1 h-px bg-bs-6" />
);

const DropdownHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <RadixDropdown.Label className={`px-4 py-1 text-xs text-muted uppercase tracking-wider ${className}`}>
        {children}
    </RadixDropdown.Label>
);

export const Dropdown = Object.assign(DropdownRoot, {
    Toggle: DropdownToggle,
    Menu: DropdownMenu,
    Item: DropdownItem,
    Divider: DropdownDivider,
    Header: DropdownHeader,
});

// DropdownButton — convenience: trigger + menu in one component
interface DropdownButtonProps {
    title: React.ReactNode;
    variant?: Variant;
    size?: 'sm' | 'lg';
    id?: string;
    align?: 'start' | 'end';
    className?: string;
    children: React.ReactNode;
    disabled?: boolean;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
    title,
    variant = 'secondary',
    size,
    align = 'start',
    className = '',
    children,
    disabled,
}) => (
    <RadixDropdown.Root>
        <div className={`relative inline-block ${className}`}>
            <RadixDropdown.Trigger asChild>
                <Button variant={variant} size={size} disabled={disabled}>
                    {title} <span className="ml-1 opacity-70">▾</span>
                </Button>
            </RadixDropdown.Trigger>
            <RadixDropdown.Portal>
                <RadixDropdown.Content align={align} className={menuContent} sideOffset={2}>
                    {children}
                </RadixDropdown.Content>
            </RadixDropdown.Portal>
        </div>
    </RadixDropdown.Root>
);
