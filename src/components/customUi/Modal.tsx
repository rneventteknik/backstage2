import React, { useEffect, ReactNode }  from 'react';

interface ModalProps {
  children: ReactNode;
  show: boolean;
  onHide?: () => void;
  backdrop?: 'static'; // TODO: Add backdrop prop
  size?: 'sm' | 'md' | 'lg' | 'xl'; // TODO: Add size prop
}

export const Modal: React.FC<ModalProps> = ({ children, show, onHide }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onHide) onHide();
    };

    if (show) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {children}
      </div>
    </div>
  );
};

type ModalHeaderProps = {
  children: ReactNode;
  closeButton?: boolean; // TODO
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => {
  return <div className="text-lg font-semibold mb-4">{children}</div>;
};

type ModalBodyProps = {
  children: ReactNode;
};

export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

type ModalFooterProps = {
  children: ReactNode;
};

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return <div className="flex justify-end">{children}</div>;
};

type ModalTitleProps = {
    children: ReactNode;
};  

export const ModalTitle: React.FC<ModalTitleProps> = ({ children }) => {
    return <div className="text-lg font-semibold mb-4">{children}</div>;
}