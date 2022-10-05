import React from 'react';
import { Booking, BookingViewModel } from '../models/interfaces';
import BookingTypeTag from '../components/utils/BookingTypeTag';
import { TableDisplay, TableConfiguration } from '../components/TableDisplay';
import { getStatusName } from '../lib/utils';
import { Card } from 'react-bootstrap';
import TableStyleLink from '../components/utils/TableStyleLink';
import Skeleton from 'react-loading-skeleton';
import RentalStatusTag from './utils/RentalStatusTag';
import { toBookingViewModel } from '../lib/datetimeUtils';

type Props = {
    title: string;
    bookings: Booking[] | undefined;
    tableSettingsOverride?: Partial<TableConfiguration<BookingViewModel>>;
};

const BookingNameDisplayFn = (booking: BookingViewModel) => (
    <>
        <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>

        <BookingTypeTag booking={booking} className="ml-1" />
        <RentalStatusTag booking={booking} className="ml-1" />
        <p className="text-muted mb-0">{getStatusName(booking.status)}</p>
        <p className="text-muted mb-0 d-sm-none">{booking.customerName ?? '-'}</p>
    </>
);

const BookingUsageIntervalDisplayFn = (booking: BookingViewModel) => (
    <>
        <p className="mb-0">{booking.displayUsageInterval}</p>
        {booking.displayUsageInterval !== booking.displayEquipmentOutInterval ? (
            <p className="text-muted mb-0">{booking.displayEquipmentOutInterval}</p>
        ) : null}
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
            cellHideSize: 'sm',
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (booking: BookingViewModel) => booking.isoFormattedUsageStartString,
            getContentOverride: BookingUsageIntervalDisplayFn,
            columnWidth: 180,
        },
    ],
};

const SmallBookingTable: React.FC<Props> = ({ title, bookings, tableSettingsOverride = {} }: Props) => {
    if (!bookings) {
        return <Skeleton height={150} className="mb-3" />;
    }

    return (
        <Card className="mb-3">
            <Card.Header>{title}</Card.Header>
            <TableDisplay
                entities={bookings.map(toBookingViewModel)}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
            />
        </Card>
    );
};

export default SmallBookingTable;
