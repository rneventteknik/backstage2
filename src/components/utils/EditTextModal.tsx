import React, { useState } from 'react';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';

type Props = {
    text: string | undefined;
    onSubmit: (text: string) => void;
    onCancel?: () => void;
    hide: () => void;
    show: boolean;
    modalTitle: string;
    modalHelpText?: string;
    modalConfirmText: string;
    modalSize?: 'sm' | 'lg' | 'xl';
    textarea?: boolean;
    textFieldSuffix?: string;
    textIsValid?: (x: string) => boolean;
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
    modalSize = 'lg',
    textarea = true,
    textFieldSuffix = undefined,
    textIsValid = undefined,
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
        <Modal show={show} onHide={onCancel} size={modalSize} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {textarea ? (
                    <Form.Control
                        as="textarea"
                        name="note"
                        rows={10}
                        defaultValue={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                ) : (
                    <InputGroup>
                        <Form.Control
                            type="text"
                            name="note"
                            defaultValue={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        {textFieldSuffix ? <InputGroup.Text>{textFieldSuffix}</InputGroup.Text> : null}
                    </InputGroup>
                )}
                <Form.Text className="text-muted">{modalHelpText}</Form.Text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Avbryt
                </Button>
                <Button variant="primary" onClick={() => onSubmit(text)} disabled={textIsValid && !textIsValid(text)}>
                    {modalConfirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditTextModal;
