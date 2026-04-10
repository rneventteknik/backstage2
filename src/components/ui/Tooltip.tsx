'use client';
import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

// Global provider — add to _app.tsx
export const TooltipProvider = RadixTooltip.Provider;

// Tooltip — just a styled content wrapper; consumed by OverlayTrigger
export const Tooltip: React.FC<{ id?: string; children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <div className={`px-2 py-1 text-xs text-body bg-bs-7 shadow max-w-xs ${className}`}>{children}</div>
);

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

interface OverlayTriggerProps {
    overlay: React.ReactElement;
    placement?: Placement;
    children: React.ReactElement;
    delay?: number | { show: number; hide: number };
}

// Maps Bootstrap placement to Radix side
const placementToSide: Record<string, RadixTooltip.TooltipContentProps['side']> = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    auto: 'top',
};

export const OverlayTrigger: React.FC<OverlayTriggerProps> = ({ overlay, placement = 'top', children }) => (
    <RadixTooltip.Root delayDuration={300}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
            <RadixTooltip.Content
                side={placementToSide[placement] ?? 'top'}
                sideOffset={4}
                className="z-50 animate-in fade-in-0 zoom-in-95"
            >
                {overlay}
                <RadixTooltip.Arrow className="fill-bs-7" />
            </RadixTooltip.Content>
        </RadixTooltip.Portal>
    </RadixTooltip.Root>
);
