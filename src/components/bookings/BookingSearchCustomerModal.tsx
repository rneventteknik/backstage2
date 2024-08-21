import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Customer } from '../../models/interfaces/Customer';
import CustomerSearch from '../CustomerSearch';

type Props = {
    onSubmit: (customer: Customer) => void;
    onCancel?: () => void;
    hide: () => void;
    show: boolean;
    previousCustomer?: Customer;
};

const BookingSearchCustomerModal: React.FC<Props> = ({
    onSubmit: onSubmitCallback,
    onCancel: onCancelCallback,
    hide,
    show,
    previousCustomer,
}: Props) => {
    const [customer, setCustomer] = useState<Customer | null>(previousCustomer ?? null);

    const onSubmit = (customer: Customer) => {
        hide();
        onSubmitCallback(customer);
        setCustomer(null);
    };
    const onCancel = () => {
        hide();
        onCancelCallback ? onCancelCallback() : null;
        setCustomer(null);
    };

    return (
        <Modal show={show} onHide={onCancel} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Sök kund</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CustomerSearch
                    id={'customer-search'}
                    placeholder={customer?.name ?? 'Sök...'}
                    onSelect={(x) => setCustomer(x)}
                    autoFocus={true}
                />
                <Form.Text className="text-muted">
                    Välj kund genom att söka i fältet ovan. Kundens namn, fakturaadress, och hogia-id kommer att
                    kopieras till bokningen.
                </Form.Text>

                {customer ? (
                    <p className="mt-3 mb-1">
                        <strong>Vald kund:</strong> {customer.name}
                    </p>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Avbryt
                </Button>
                <Button
                    variant="primary"
                    onClick={() => (!!customer ? onSubmit(customer) : null)}
                    disabled={customer === null}
                >
                    Spara
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BookingSearchCustomerModal;
