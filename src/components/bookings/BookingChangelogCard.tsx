import React, { useState } from 'react';
import { Card, ListGroup, Modal } from 'react-bootstrap';
import { formatDatetimeWithYear } from '../../lib/datetimeUtils';
import { addVAT, formatCurrency, getCorrectPriceBasedOnBookingState } from '../../lib/pricingUtils';
import { BookingChangelogEntry } from '../../models/interfaces/ChangeLogEntry';
import BookingPriceSummaryDisplay from './BookingPriceSummary';
import currency from 'currency.js';

type Props = {
    changelog: BookingChangelogEntry[];
};

const defaultListLength = 3;

const getDisplayPrice = (entry: BookingChangelogEntry): currency | null => {
    if (!hasPriceInformation(entry)) return null;
    return addVAT(
        getCorrectPriceBasedOnBookingState({
            equipmentPrice: entry.equipmentPrice ?? currency(0),
            timeEstimatePrice: entry.timeEstimatePrice ?? currency(0),
            timeReportsPrice: entry.timeReportsPrice ?? null,
            fixedPrice: entry.fixedPrice ?? null,
        }),
    );
};

const hasPriceInformation = (entry: BookingChangelogEntry): boolean =>
    entry.equipmentPrice !== null && entry.equipmentPrice !== undefined;

const ChangelogEntryContent: React.FC<{ entry: BookingChangelogEntry; onClick?: () => void }> = ({
    entry,
    onClick,
}) => {
    const displayPrice = getDisplayPrice(entry);

    return (
        <ListGroup.Item key={entry.id}>
            <div style={onClick ? { cursor: 'pointer' } : {}} onClick={onClick}>
                {entry.name}
            </div>
            {displayPrice !== null ? <div className="text-muted">{formatCurrency(displayPrice)}</div> : null}
            <div className="text-muted">{entry.updated ? formatDatetimeWithYear(entry.updated) : 'N/A'}</div>
        </ListGroup.Item>
    );
};

const BookingChangelogCard: React.FC<Props> = ({ changelog }: Props) => {
    const [showAllModal, setShowAllModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<BookingChangelogEntry | null>(null);

    const handleEntryClick = (entry: BookingChangelogEntry) => {
        if (hasPriceInformation(entry)) {
            setSelectedEntry(entry);
        }
    };

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
                    {changelog.slice(0, defaultListLength).map((entry) => (
                        <ChangelogEntryContent
                            key={entry.id}
                            entry={entry}
                            onClick={hasPriceInformation(entry) ? () => handleEntryClick(entry) : undefined}
                        />
                    ))}
                </ListGroup>
            </Card>

            <Modal show={showAllModal} onHide={() => setShowAllModal(false)} size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Ändringshistorik</Modal.Title>
                </Modal.Header>
                <ListGroup variant="flush">
                    {changelog.map((entry) => (
                        <ChangelogEntryContent
                            key={entry.id}
                            entry={entry}
                            onClick={
                                hasPriceInformation(entry)
                                    ? () => {
                                          setShowAllModal(false);
                                          setSelectedEntry(entry);
                                      }
                                    : undefined
                            }
                        />
                    ))}
                </ListGroup>
            </Modal>

            <Modal show={selectedEntry !== null} onHide={() => setSelectedEntry(null)} size="lg">
                {selectedEntry !== null && hasPriceInformation(selectedEntry) ? (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedEntry.updated ? formatDatetimeWithYear(selectedEntry.updated) : 'N/A'} - {selectedEntry?.name}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body className="p-0">
                            <Card className="mt-3">
                                <Card.Header>
                                    Prisinformation (inkl. moms)
                                </Card.Header>
                                <Card.Body>
                                    <BookingPriceSummaryDisplay
                                        bookingPriceSummary={{
                                            equipmentPrice: selectedEntry.equipmentPrice ?? currency(0),
                                            timeEstimatePrice: selectedEntry.timeEstimatePrice ?? currency(0),
                                            timeReportsPrice: selectedEntry.timeReportsPrice ?? null,
                                            fixedPrice: selectedEntry.fixedPrice ?? null,
                                        }}
                                    />
                                </Card.Body>
                            </Card>
                        </Modal.Body>
                    </>
                ) : null}
            </Modal>
        </>
    );
};

export default BookingChangelogCard;
