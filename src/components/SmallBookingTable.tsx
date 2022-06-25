import React from 'react';
import { Booking, BookingViewModel } from '../models/interfaces';
import BookingTypeTag from '../components/utils/BookingTypeTag';
import { TableDisplay, TableConfiguration } from '../components/TableDisplay';
import { getStatusName, toBookingViewModel } from '../lib/utils';
import { Card } from 'react-bootstrap';
import TableStyleLink from '../components/utils/TableStyleLink';
import Skeleton from 'react-loading-skeleton';

type Props = {
    title: string;
    bookings: Booking[] | undefined;
};

const BookingNameDisplayFn = (booking: BookingViewModel) => (
    <>
        <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>

        <BookingTypeTag booking={booking} className="ml-1" />
        <p className="text-muted mb-0">{getStatusName(booking.status)}</p>
        <p className="text-muted mb-0 d-sm-none">{booking.displayStartDate}</p>
    </>
);

const tableSettings: TableConfiguration<BookingViewModel> = {
    entityTypeDisplayName: 'bokningar',
    defaultSortPropertyName: 'date',
    defaultSortAscending: true,
    hideTableFilter: true,
    hideTableCountControls: true,
    columns: [
        {
            key: 'name',
            displayName: 'Bokning',
            getValue: (booking: BookingViewModel) => booking.name,
            textTruncation: true,
            getContentOverride: BookingNameDisplayFn,
            columnWidth: 300,
        },
        {
            key: 'customerName',
            displayName: 'Beställare',
            getValue: (booking: BookingViewModel) => booking.customerName ?? '-',
            textTruncation: true,
            columnWidth: 300,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (booking: BookingViewModel) => booking.displayStartDate,
            cellHideSize: 'sm',
            columnWidth: 100,
        },
    ],
};

const SmallBookingTable: React.FC<Props> = ({ title, bookings }: Props) => {
    if (!bookings) {
        return <Skeleton height={150} className="mb-3" />;
    }

    return (
        <Card className="mb-3">
            <Card.Header>{title}</Card.Header>
            <TableDisplay entities={bookings.map(toBookingViewModel)} configuration={tableSettings} />
        </Card>
    );
};

export default SmallBookingTable;
