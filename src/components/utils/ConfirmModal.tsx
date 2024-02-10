import React, { ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';

type Props = {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmButtonType?: 'danger' | 'primary' | 'secondary';
    cancelButtonType?: 'danger' | 'primary' | 'secondary';
    children?: ReactNode;
};

const ConfirmModal: React.FC<Props> = ({
    show,
    onHide,
    onConfirm,
    title,
    confirmLabel = 'Fortsätt',
    cancelLabel = 'Avbryt',
    confirmButtonType = 'danger',
    cancelButtonType = 'secondary',
    children,
}: Props) => {
    return (
        <Modal show={show} onHide={() => onHide()}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
                <Button variant={cancelButtonType} onClick={() => onHide()}>
                    {cancelLabel}
                </Button>
                <Button variant={confirmButtonType} onClick={() => onConfirm()}>
                    {confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
