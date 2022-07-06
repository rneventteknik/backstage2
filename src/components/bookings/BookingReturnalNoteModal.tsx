import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Booking } from '../../models/interfaces';

type Props = {
    booking: Partial<Booking>;
    onSubmit: (returnalNote: string) => void;
    onCancel?: () => void;
    hide: () => void;
    show: boolean;
};

const BookingReturnalNoteModal: React.FC<Props> = ({
    booking,
    onSubmit: onSubmitCallback,
    onCancel: onCancelCallback,
    hide,
    show,
}: Props) => {
    const [returnalNote, setReturnalNote] = useState(booking.returnalNote ?? '');

    const onSubmit = (returnalNote: string) => {
        hide();
        onSubmitCallback(returnalNote);
    };
    const onCancel = () => {
        hide();
        onCancelCallback ? onCancelCallback() : null;
    };
    return (
        <Modal show={show} onHide={onCancel} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Återlämningsanmärkning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control
                    as="textarea"
                    name="note"
                    rows={4}
                    defaultValue={returnalNote}
                    onChange={(e) => setReturnalNote(e.target.value)}
                />
                <Form.Text className="text-muted">
                    Notera eventuell saknad eller skadad utrustning i fältet ovan.
                </Form.Text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={hide}>
                    Avbryt
                </Button>
                <Button variant="primary" onClick={() => onSubmit(returnalNote)}>
                    Markera som återlämnad
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BookingReturnalNoteModal;
