import React from 'react';
import { Badge, Form, ListGroup } from 'react-bootstrap';
import { UserCard } from '../../models/interfaces/UserCard';

type Props = {
    cards: UserCard[];
    selectedCardIds: number[];
    onToggleCard: (cardId: number) => void;
};

const UserCardList: React.FC<Props> = ({ cards, selectedCardIds, onToggleCard }: Props) => {
    if (!cards || cards.length === 0) {
        return <div className="text-muted small">Inga kort registrerade</div>;
    }

    return (
        <ListGroup>
            {cards.map((card) => {
                const isSelected = selectedCardIds.includes(card.id!);

                return (
                    <ListGroup.Item
                        key={card.id}
                        action
                        as="label"
                        htmlFor={'removeCard' + card.id}
                        variant={isSelected ? 'danger' : undefined}
                        className="d-flex align-items-center gap-3"
                    >
                        <Form.Check
                            type="checkbox"
                            id={'removeCard' + card.id}
                            checked={isSelected}
                            onChange={() => onToggleCard(card.id!)}
                            aria-label={'Ta bort ' + card.cardName}
                        />
                        <div className="flex-grow-1">
                            <strong className={isSelected ? 'text-decoration-line-through' : undefined}>
                                {card.cardName}
                            </strong>
                            {card.created && (
                                <div className="text-muted small">
                                    Registrerat: {new Date(card.created).toLocaleDateString('sv-SE')}
                                </div>
                            )}
                        </div>
                        {isSelected && <Badge bg="danger">Tas bort</Badge>}
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    );
};

export default UserCardList;
