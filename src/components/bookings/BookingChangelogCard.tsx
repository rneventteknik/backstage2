import React, { useState } from 'react';
import { Card, ListGroup, Modal } from 'react-bootstrap';
import { formatDatetime } from '../../lib/utils';
import { BookingChangelogEntry } from '../../models/interfaces/ChangeLogEntry';

type Props = {
    changelog: BookingChangelogEntry[];
};

const defaultListLength = 3;

const BookingChangelogCard: React.FC<Props> = ({ changelog }: Props) => {
    const [showAllModal, setShowAllModal] = useState(false);

    return (
        <>
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1">Senaste ändringar</span>
                    <a href="#" onClick={() => setShowAllModal(true)}>
                        Visa alla ({changelog.length})
                    </a>
                </Card.Header>
                <ListGroup variant="flush">
                    {changelog.slice(0, defaultListLength).map((changelogEntry) => (
                        <ListGroup.Item key={changelogEntry.id}>
                            <div className="mb-1">{changelogEntry.name}</div>
                            <div className="text-muted">
                                {changelogEntry.updated ? formatDatetime(changelogEntry.updated) : 'N/A'}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
            <Modal show={showAllModal} onHide={() => setShowAllModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Ändringshistorik</Modal.Title>
                </Modal.Header>
                <ListGroup variant="flush">
                    {changelog.map((changelogEntry) => (
                        <ListGroup.Item key={changelogEntry.id}>
                            <div className="mb-1">{changelogEntry.name}</div>
                            <div className="text-muted">
                                {changelogEntry.updated ? formatDatetime(changelogEntry.updated) : 'N/A'}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal>
        </>
    );
};

export default BookingChangelogCard;
