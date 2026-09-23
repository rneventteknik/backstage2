import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { UserCard } from '../../models/interfaces/UserCard';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    cards: UserCard[];
    onRemoveCard: (cardId: number) => void;
};

const UserCardList: React.FC<Props> = ({ cards, onRemoveCard }: Props) => {
    if (!cards || cards.length === 0) {
        return <div className="text-muted small">Inga kort registrerade</div>;
    }

    return (
        <ListGroup>
            {cards.map((card) => (
                <ListGroup.Item key={card.id} className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>{card.cardName}</strong>
                        {card.created && (
                            <div className="text-muted small">
                                Registrerat: {new Date(card.created).toLocaleDateString('sv-SE')}
                            </div>
                        )}
                    </div>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onRemoveCard(card.id!)}
                        title="Ta bort kort"
                    >
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Ta bort
                    </Button>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default UserCardList;
