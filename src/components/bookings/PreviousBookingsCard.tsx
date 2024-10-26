import React, { useState } from 'react';
import { Card, ListGroup, Modal } from 'react-bootstrap';
import { toBookingViewModel } from '../../lib/datetimeUtils';
import useSwr from 'swr';
import { faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableStyleLink from '../utils/TableStyleLink';
import Skeleton from 'react-loading-skeleton';
import { bookingsFetcher } from '../../lib/fetchers';
import { getSortedList } from '../../lib/sortIndexUtils';
import LargeBookingTable from '../LargeBookingTable';

type Props = {
    hogiaId: number | null;
    bookingId: number;
};

const defaultListLength = 3;

const PreviousBookingsCard: React.FC<Props> = ({ hogiaId, bookingId }: Props) => {
    if (hogiaId === null) {
        return (
            <Card className="mb-3">
                <Card.Header>Andra bokningar för kund</Card.Header>
                <Card.Body>
                    <p className="text-muted mb-0">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                        Endast tillgängligt för kunder med Hogia Id.
                    </p>
                </Card.Body>
            </Card>
        );
    }

    return <PreviousBookingsCardList hogiaId={hogiaId} bookingId={bookingId} />;
};

type PreviousBookingsCardProps = {
    hogiaId: number | null;
    bookingId: number;
};

const PreviousBookingsCardList: React.FC<PreviousBookingsCardProps> = ({
    hogiaId,
    bookingId,
}: PreviousBookingsCardProps) => {
    const [showAllModal, setShowAllModal] = useState(false);
    const { data: list, error } = useSwr('/api/bookings', bookingsFetcher);

    // Error handling
    //
    if (error) {
        return (
            <div className="p-3">
                <p className="text-danger">
                    <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda bokningarna.
                </p>
                <p className="text-monospace text-muted mb-0">{error.message}</p>
            </div>
        );
    }

    // Loading skeleton
    //
    if (!list) {
        return <Skeleton height={150} className="mb-3" />;
    }

    const bookingViewModels = list
        .filter((x) => x.invoiceHogiaId === hogiaId)
        .filter((x) => x.id !== bookingId)
        .map(toBookingViewModel)
        .map((x) => ({ ...x, sortIndex: -(x.usageStartDatetime?.getTime() ?? 0) }));

    const sortedBookingViewModels = getSortedList(bookingViewModels);

    return (
        <>
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1">Andra bokningar för kund</span>
                    <a href="#" onClick={() => setShowAllModal(true)}>
                        Visa alla ({sortedBookingViewModels.length})
                    </a>
                </Card.Header>
                <ListGroup variant="flush">
                    {sortedBookingViewModels.slice(0, defaultListLength).map((booking) => (
                        <ListGroup.Item key={booking.id}>
                            <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>
                            <p className="mb-0 text-muted">{booking.monthYearUsageStartString}</p>
                        </ListGroup.Item>
                    ))}
                    {sortedBookingViewModels.length === 0 ? (
                        <ListGroup.Item className="text-center font-italic text-muted">
                            Denna kund har inga andra bokningar.
                        </ListGroup.Item>
                    ) : null}
                </ListGroup>
            </Card>
            <Modal show={showAllModal} onHide={() => setShowAllModal(false)} size="xl" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Andra bokningar för kund</Modal.Title>
                </Modal.Header>
                <LargeBookingTable
                    bookings={sortedBookingViewModels}
                    showAdvancedFilters={false}
                    tableSettingsOverride={{
                        hideTableCountControls: true,
                    }}
                />
            </Modal>
        </>
    );
};

export default PreviousBookingsCard;
