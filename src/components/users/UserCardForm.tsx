import React, { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import RequiredIndicator from '../utils/RequiredIndicator';

export type UserCardRequest = {
    userId: number;
    cardId?: string;
    cardName?: string;
    removeCard?: boolean;
    existingPassword: string;
};

type Props = {
    handleSubmit: (request: UserCardRequest) => void;
    userId: number;
    formId: string;
    requirePasswordConfirmation?: boolean;
    hasExistingCard: boolean;
};

const UserCardForm: React.FC<Props> = ({
    handleSubmit: handleSubmitNfcCard,
    userId,
    formId,
    requirePasswordConfirmation = true,
    hasExistingCard,
}: Props) => {
    const [validated, setValidated] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const cardIdField = form.elements.namedItem('cardId') as HTMLInputElement | null;
        const cardNameField = form.elements.namedItem('cardName') as HTMLInputElement | null;
        const passwordField = form.elements.namedItem('existingPassword') as HTMLInputElement | null;
        const cardId = cardIdField?.value?.trim() ?? '';
        const cardName = cardNameField?.value?.trim() ?? '';
        const existingPassword = passwordField?.value ?? '';

        const normalizedCardId = cardId.replace(/[\s:-]/g, '').toUpperCase();
        const isValidCardId = /^[0-9A-F]{8,14}$/.test(normalizedCardId);

        if (!hasExistingCard && !cardId) {
            cardIdField?.setCustomValidity('Ange kortvärdet som ska registreras.');
        } else if (!hasExistingCard && !isValidCardId) {
            cardIdField?.setCustomValidity(
                'Ogiltigt NFC-kortvärde. Ange ett hexadecimalt UID på 4- eller 7-byte format (t.ex. 04A23B4C eller 04:A2:3B:4C:5D:6E:7F).',
            );
        } else {
            cardIdField?.setCustomValidity('');
        }

        if (requirePasswordConfirmation && !existingPassword) {
            passwordField?.setCustomValidity('Ange ditt nuvarande lösenord för att bekräfta åtgärden.');
        } else {
            passwordField?.setCustomValidity('');
        }

        if (
            (!hasExistingCard && !cardId) ||
            (!hasExistingCard && !isValidCardId) ||
            (requirePasswordConfirmation && !existingPassword)
        ) {
            setValidated(true);
            return;
        }

        const request: UserCardRequest = {
            userId,
            existingPassword,
            removeCard: hasExistingCard,
            ...(hasExistingCard ? {} : { cardId, cardName }),
        };

        handleSubmitNfcCard(request);
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Form.Group controlId="formCardId" className="mt-3">
                <Form.Label>
                    Kort-ID
                    <RequiredIndicator />
                </Form.Label>
                <Form.Control
                    type="text"
                    name="cardId"
                    placeholder="Blippa kortet eller ange UID/hex-ID"
                    autoComplete="off"
                    autoFocus
                />
                <Form.Text className="text-muted">
                    Ange NFC-taggens faktiska UID/hex-ID, inte det textvärde som är skrivet på kortet.
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="formCardName" className="mt-3">
                <Form.Label>Kortnamn</Form.Label>
                <Form.Control
                    type="text"
                    name="cardName"
                    placeholder="T.ex. Huvudkortet, Reservkortet"
                    autoComplete="off"
                />
                <Form.Text className="text-muted">Ett användarvänligt namn för att identifiera kortet.</Form.Text>
            </Form.Group>

            {requirePasswordConfirmation && (
                <>
                    <hr className="my-4" />
                    <Form.Group controlId="formExistingPassword">
                        <Form.Label>
                            Ditt nuvarande lösenord
                            <RequiredIndicator />
                        </Form.Label>
                        <Form.Control required type="password" name="existingPassword" autoComplete="off" />
                        <Form.Text className="text-muted">
                            Bekräfta din identitet genom att ange ditt nuvarande lösenord.
                        </Form.Text>
                    </Form.Group>
                </>
            )}
        </Form>
    );
};

export default UserCardForm;
