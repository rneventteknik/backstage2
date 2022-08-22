import React, { ReactNode } from 'react';
import { Button, Modal } from 'react-bootstrap';

type Props = {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title: string;
    confirmLabel?: string;
    cancelLabel?: string;
    children?: ReactNode;
};

const ConfirmModal: React.FC<Props> = ({
    show,
    onHide,
    onConfirm,
    title,
    confirmLabel = 'Fortsätt',
    cancelLabel = 'Avbryt',
    children,
}: Props) => {
    return (
        <Modal show={show} onHide={() => onHide()}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children}</Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => onConfirm()}>
                    {confirmLabel}
                </Button>
                <Button variant="secondary" onClick={() => onHide()}>
                    {cancelLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
