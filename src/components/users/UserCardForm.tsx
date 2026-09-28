import React, { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import RequiredIndicator from '../utils/RequiredIndicator';
import { isValidCardId, normalizeCardId } from '../../lib/cardId';
import { UserCard } from '../../models/interfaces/UserCard';
import UserCardList from './UserCardList';

export type UserCardRequest = {
    userId: number;
    cardId?: string;
    cardName?: string;
    removeCardIds: number[];
    existingPassword: string;
};

type Props = {
    handleSubmit: (request: UserCardRequest) => void;
    userId: number;
    formId: string;
    cards: UserCard[];
};

// The card ID is optional if the user is only removing cards
const getCardIdError = (cardId: string, isRemovingCards: boolean): string | null => {
    if (!cardId.trim()) {
        return isRemovingCards ? null : 'Ange kortvärdet som ska registreras, eller markera kort att ta bort.';
    }

    if (!isValidCardId(cardId)) {
        return 'Ogiltigt NFC-kortvärde. Ange ett hexadecimalt UID på 4- eller 7-byte format (t.ex. 04A23B4C eller 04:A2:3B:4C:5D:6E:7F).';
    }

    return null;
};

const getPasswordError = (password: string): string | null =>
    !password ? 'Ange ditt nuvarande lösenord för att bekräfta åtgärden.' : null;

const UserCardForm: React.FC<Props> = ({ handleSubmit: handleSubmitNfcCard, userId, formId, cards }: Props) => {
    const [removeCardIds, setRemoveCardIds] = useState<number[]>([]);
    const [cardId, setCardId] = useState('');
    const [cardName, setCardName] = useState('');
    const [existingPassword, setExistingPassword] = useState('');

    // Errors are only shown after the first submit attempt, after that they update as the user types
    const [showErrors, setShowErrors] = useState(false);

    const cardIdError = getCardIdError(cardId, removeCardIds.length > 0);
    const passwordError = getPasswordError(existingPassword);

    const toggleRemoveCard = (id: number) =>
        setRemoveCardIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowErrors(true);

        if (cardIdError || passwordError) {
            return;
        }

        handleSubmitNfcCard({
            userId,
            existingPassword,
            removeCardIds,
            ...(cardId.trim() ? { cardId: cardId.trim(), cardName: cardName.trim() } : {}),
        });
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate>
            <h6 className="mb-3">Registrerade kort</h6>
            <UserCardList cards={cards} selectedCardIds={removeCardIds} onToggleCard={toggleRemoveCard} />
            {cards.length > 0 && <Form.Text className="text-muted">Markera de kort som ska tas bort.</Form.Text>}

            <hr className="my-4" />

            <h6 className="mb-3">Lägg till nytt kort</h6>
            <Form.Group controlId="formCardId" className="mt-3">
                <Form.Label>Kort-ID</Form.Label>
                <Form.Control
                    type="text"
                    name="cardId"
                    placeholder="Blippa kortet eller ange UID/hex-ID"
                    autoComplete="off"
                    autoFocus
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    isInvalid={showErrors && !!cardIdError}
                    isValid={showErrors && !cardIdError && !!cardId.trim()}
                />
                <Form.Control.Feedback type="invalid">{cardIdError}</Form.Control.Feedback>
                <Form.Control.Feedback type="valid">Registreras som {normalizeCardId(cardId)}</Form.Control.Feedback>
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
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                />
                <Form.Text className="text-muted">Ett användarvänligt namn för att identifiera kortet.</Form.Text>
            </Form.Group>

            <hr className="my-4" />
            <Form.Group controlId="formExistingPassword">
                <Form.Label>
                    Ditt nuvarande lösenord
                    <RequiredIndicator />
                </Form.Label>
                <Form.Control
                    type="password"
                    name="existingPassword"
                    autoComplete="off"
                    value={existingPassword}
                    onChange={(e) => setExistingPassword(e.target.value)}
                    isInvalid={showErrors && !!passwordError}
                />
                <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
                <Form.Text className="text-muted">
                    Bekräfta din identitet genom att ange ditt nuvarande lösenord.
                </Form.Text>
            </Form.Group>
        </Form>
    );
};

export default UserCardForm;
