import React from 'react';
import { Booking } from '../models/interfaces';
import {
    BookingsWithPotentialProblemsResult,
    getBookingsWithPotentialProblems,
} from '../lib/bookingsWithPotentialProblemsUtils';
import { TableConfiguration, TableDisplay } from './TableDisplay';
import { getStatusColor, getStatusName } from '../lib/utils';
import BookingStatusTag from './utils/BookingStatusTag';
import BookingTypeTag from './utils/BookingTypeTag';
import FixedPriceStatusTag from './utils/FixedPriceStatusTag';
import InternalReservationTag from './utils/InternalReservationTag';
import RentalStatusTag from './utils/RentalStatusTag';
import TableStyleLink from './utils/TableStyleLink';
import { HasId } from '../models/interfaces/BaseEntity';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card } from 'react-bootstrap';
import { formatDatetime } from '../lib/datetimeUtils';
import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';
import WarningIcon from './utils/WarningIcon';

type Props = {
    bookings?: Booking[];
};

const BookingsWithPotentialProblemsCard: React.FC<Props> = ({ bookings }: Props) => {
    if (!bookings) {
        return <Skeleton height={150} className="mb-3" />;
    }

    const bookingsWithPotentialProblems = getBookingsWithPotentialProblems(bookings);
    const bookingsWithPotentialProblemsWithId = bookingsWithPotentialProblems.map((x) => ({ ...x, id: x.booking.id }));

    const BookingNameDisplayFn = (result: BookingsWithPotentialProblemsResult) => (
        <>
            <TableStyleLink href={'/bookings/' + result.booking.id}>{result.booking.name}</TableStyleLink>
            <BookingStatusTag booking={result.booking} className="ml-1" />
            <BookingTypeTag booking={result.booking} className="ml-1" />
            <RentalStatusTag booking={result.booking} className="ml-1" />
            <InternalReservationTag booking={result.booking} className="ml-1" />
            <FixedPriceStatusTag booking={result.booking} className="ml-1" />
            <p className="text-muted mb-0">{result.booking.customerName ?? '-'}</p>
            <p className="mb-0 text-muted">{result.booking.monthYearUsageStartString}</p>
        </>
    );

    const BookingUsageIntervalDisplayFn = (result: BookingsWithPotentialProblemsResult) => (
        <>
            {result.shouldBeBooked ? (
                <p className="mb-1">
                    Inte markerat som bokad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning lämnas ut ${formatDatetime(result.booking.equipmentOutDatetime)} och är fortfarande inte markerad som bokad.`}
                    />
                </p>
            ) : null}
            {result.shouldBeDone ? (
                <p className="mb-1">
                    Inte klarmarkerad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning återlämnades ${formatDatetime(result.booking.equipmentInDatetime)} och är fortfarande inte klarmarkerad.`}
                    />
                </p>
            ) : null}
            {result.shouldBeOut.length > 0 ? (
                <p className="mb-1">
                    Inte utlämnad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning har utrustningslistor som borde ha lämnats ut men som inte markerats som utlämnade (${result.shouldBeOut.map((x) => x.name).join(', ')}).`}
                    />
                </p>
            ) : null}
            {result.shouldBeIn.length > 0 ? (
                <p className="mb-1">
                    Inte återlämnad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning har utrustningslistor som borde ha återlämnats men som inte markerats som återlämnade (${result.shouldBeIn.map((x) => x.name).join(', ')}).`}
                    />
                </p>
            ) : null}
        </>
    );

    const tableSettings: TableConfiguration<BookingsWithPotentialProblemsResult & HasId> = {
        entityTypeDisplayName: 'bokningar',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        statusColumns: [
            {
                key: 'status',
                getValue: (x: BookingsWithPotentialProblemsResult) => getStatusName(x.booking.status),
                getColor: (x: BookingsWithPotentialProblemsResult) => getStatusColor(x.booking.status),
            },
        ],
        columns: [
            {
                key: 'name',
                displayName: 'Bokning',
                getValue: (x: BookingsWithPotentialProblemsResult) => x.booking.name,
                textTruncation: true,
                getContentOverride: BookingNameDisplayFn,
                columnWidth: 300,
            },
            {
                key: 'problem',
                displayName: 'Potentiella problem',
                getValue: (x: BookingsWithPotentialProblemsResult) => x.booking.isoFormattedUsageStartString,
                getContentOverride: BookingUsageIntervalDisplayFn,
                columnWidth: 220,
            },
        ],
    };

    return (
        <>
            <Card>
                <Card.Header className="d-flex justify-content-between">
                    Dina bokningar med potentiella problem
                    <Link href="/bookings/problems" passHref>
                        <Button
                            variant="secondary"
                            size="sm"
                            as="span"
                        >
                            <FontAwesomeIcon icon={faList} /> Visa alla
                        </Button>
                    </Link>
                </Card.Header>
                {bookingsWithPotentialProblems.length === 0 ? <Card.Body>Inga bokningar med potentiella problem.</Card.Body> :
                <TableDisplay entities={bookingsWithPotentialProblemsWithId} configuration={tableSettings} />}
            </Card>
        </>
    );
};

export default BookingsWithPotentialProblemsCard;
