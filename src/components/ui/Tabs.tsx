'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface TabContextValue {
    activeKey: string;
    setActiveKey: (key: string) => void;
}

const TabContext = createContext<TabContextValue>({ activeKey: '', setActiveKey: () => {} });

// Tab.Container
interface TabContainerProps {
    id?: string;
    defaultActiveKey?: string;
    activeKey?: string;
    onSelect?: (key: string) => void;
    transition?: boolean;
    children: React.ReactNode;
    className?: string;
}

const TabContainer: React.FC<TabContainerProps> = ({
    defaultActiveKey = '',
    activeKey: controlledKey,
    onSelect,
    children,
    className = '',
}) => {
    const [internalKey, setInternalKey] = useState(defaultActiveKey);
    const activeKey = controlledKey !== undefined ? controlledKey : internalKey;

    const setActiveKey = useCallback(
        (key: string) => {
            if (controlledKey === undefined) setInternalKey(key);
            onSelect?.(key);
        },
        [controlledKey, onSelect],
    );

    return (
        <TabContext.Provider value={{ activeKey, setActiveKey }}>
            <div className={className}>{children}</div>
        </TabContext.Provider>
    );
};

// Tab.Content
const TabContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <div className={className}>{children}</div>
);

// Tab.Pane
const TabPane: React.FC<{ eventKey: string; className?: string; children: React.ReactNode }> = ({
    eventKey,
    className = '',
    children,
}) => {
    const { activeKey } = useContext(TabContext);
    if (activeKey !== eventKey) return null;
    return <div className={className}>{children}</div>;
};

export const Tab = Object.assign(TabContainer, {
    Container: TabContainer,
    Content: TabContent,
    Pane: TabPane,
});

// Nav
type NavVariant = 'tabs' | 'pills' | 'underline';

interface NavProps {
    variant?: NavVariant;
    className?: string;
    children: React.ReactNode;
}

const NavRoot: React.FC<NavProps> = ({ variant = 'tabs', className = '', children }) => {
    const variantClass =
        variant === 'pills'
            ? 'flex flex-wrap gap-1'
            : variant === 'underline'
              ? 'flex flex-wrap border-b border-bs-7'
              : 'flex flex-wrap border-b border-bs-7';
    return <div className={`${variantClass} ${className}`}>{children}</div>;
};

const NavItem: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <div className={className}>{children}</div>
);

interface NavLinkProps {
    eventKey?: string;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ eventKey, href, active: activeProp, disabled, className = '', children, onClick }) => {
    const ctx = useContext(TabContext);
    const isActive = activeProp !== undefined ? activeProp : eventKey !== undefined && ctx.activeKey === eventKey;

    const handleClick = () => {
        if (disabled) return;
        if (eventKey) ctx.setActiveKey(eventKey);
        onClick?.();
    };

    const activeClasses = isActive ? 'bg-primary text-white' : 'text-muted hover:text-body hover:bg-bs-4';
    const disabledClasses = disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer';

    if (href) {
        return (
            <a
                href={href}
                className={`inline-block px-4 py-2 text-sm transition-colors ${activeClasses} ${disabledClasses} ${className}`}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={handleClick}
            className={`inline-block px-4 py-2 text-sm transition-colors ${activeClasses} ${disabledClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export const Nav = Object.assign(NavRoot, {
    Item: NavItem,
    Link: NavLink,
});
