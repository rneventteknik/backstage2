import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

type Props = {
    text: string | undefined;
    onSubmit: (text: string) => void;
    onCancel?: () => void;
    hide: () => void;
    show: boolean;
    modalTitle: string;
    modalHelpText?: string;
    modalConfirmText: string;
};

const EditTextModal: React.FC<Props> = ({
    text: defaultText,
    onSubmit: onSubmitCallback,
    onCancel: onCancelCallback,
    hide,
    show,
    modalTitle,
    modalHelpText,
    modalConfirmText,
}: Props) => {
    const [text, setText] = useState(defaultText ?? '');

    const onSubmit = (returnalNote: string) => {
        hide();
        onSubmitCallback(returnalNote);
    };
    const onCancel = () => {
        setText(defaultText ?? '');
        hide();
        onCancelCallback ? onCancelCallback() : null;
    };
    return (
        <Modal show={show} onHide={onCancel} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control
                    as="textarea"
                    name="note"
                    rows={10}
                    defaultValue={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <Form.Text className="text-muted">{modalHelpText}</Form.Text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={onCancel}>
                    Avbryt
                </Button>
                <Button variant="primary" onClick={() => onSubmit(text)}>
                    {modalConfirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditTextModal;
