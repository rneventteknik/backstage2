'use client';
import React, { createContext, useContext } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

const ModalContext = createContext<{ onHide: () => void }>({ onHide: () => {} });

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface ModalProps {
    show: boolean;
    onHide?: () => void;
    size?: ModalSize;
    scrollable?: boolean;
    centered?: boolean;
    backdrop?: boolean | 'static';
    className?: string;
    children: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    xxl: 'max-w-6xl',
};

const ModalRoot: React.FC<ModalProps> = ({
    show,
    onHide = () => {},
    size = 'md',
    scrollable,
    centered,
    backdrop = true,
    className = '',
    children,
}) => {
    const handleClose = backdrop === 'static' ? () => {} : onHide;

    return (
        <ModalContext.Provider value={{ onHide }}>
            <Dialog open={show} onClose={handleClose} className="relative z-50">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

                {/* Centering wrapper */}
                <div
                    className={`fixed inset-0 overflow-y-auto flex ${centered ? 'items-center' : 'items-start pt-16'} justify-center p-4`}
                >
                    <DialogPanel
                        className={`w-full ${sizeClasses[size]} bg-bs-2 border border-bs-4 shadow-xl ${scrollable ? 'max-h-[80vh] flex flex-col' : ''} ${className}`}
                    >
                        {children}
                    </DialogPanel>
                </div>
            </Dialog>
        </ModalContext.Provider>
    );
};

const ModalHeader: React.FC<{
    closeButton?: boolean;
    onHide?: () => void;
    className?: string;
    children: React.ReactNode;
}> = ({ closeButton, onHide: onHideProp, className = '', children }) => {
    const { onHide: ctxOnHide } = useContext(ModalContext);
    const onHide = onHideProp ?? ctxOnHide;
    return (
    <div className={`flex items-center justify-between px-4 py-3 border-b border-bs-7 ${className}`}>
        <div className="flex-1">{children}</div>
        {closeButton && (
            <button
                onClick={onHide}
                className="ml-4 text-muted hover:text-body text-xl leading-none"
                aria-label="Close"
            >
                ×
            </button>
        )}
    </div>
    );
};

const ModalTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <DialogTitle as="h5" className={`text-base font-medium text-body m-0 ${className}`}>
        {children}
    </DialogTitle>
);

const ModalBody: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <div className={`px-4 py-4 ${className}`}>{children}</div>
);

const ModalFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <div className={`flex items-center justify-end gap-2 px-4 py-3 border-t border-bs-7 ${className}`}>
        {children}
    </div>
);

export const Modal = Object.assign(ModalRoot, {
    Header: ModalHeader,
    Title: ModalTitle,
    Body: ModalBody,
    Footer: ModalFooter,
});
