import React from 'react';
import { Booking, BookingViewModel } from '../models/interfaces';
import BookingTypeTag from './utils/BookingTypeTag';
import { TableDisplay, TableConfiguration } from './TableDisplay';
import { getStatusColor, getStatusName } from '../lib/utils';
import { Card } from 'react-bootstrap';
import TableStyleLink from './utils/TableStyleLink';
import Skeleton from 'react-loading-skeleton';
import RentalStatusTag from './utils/RentalStatusTag';
import { getBookingDateHeadingValue, toBookingViewModel } from '../lib/datetimeUtils';
import BookingStatusTag from './utils/BookingStatusTag';
import FixedPriceStatusTag from './utils/FixedPriceStatusTag';
import InternalReservationTag from './utils/InternalReservationTag';

type Props = {
    title: string;
    bookings: Booking[] | undefined;
    tableSettingsOverride?: Partial<TableConfiguration<BookingViewModel>>;
    showDateHeadings?: boolean;
    children?: React.ReactChild;
};

const BookingNameDisplayFn = (booking: BookingViewModel) => (
    <>
        <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>

        <BookingStatusTag booking={booking} className="ml-1" />
        <BookingTypeTag booking={booking} className="ml-1" />
        <RentalStatusTag booking={booking} className="ml-1" />
        <InternalReservationTag booking={booking} className="ml-1" />
        <FixedPriceStatusTag booking={booking} className="ml-1" />
        <p className="text-muted mb-0">{booking.customerName ?? '-'}</p>
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

const TinyBookingTable: React.FC<Props> = ({
    title,
    bookings,
    children,
    showDateHeadings = true,
    tableSettingsOverride = {},
}: Props) => {
    if (!bookings) {
        return <Skeleton height={150} className="mb-3" />;
    }

    const tableSettings: TableConfiguration<BookingViewModel> = {
        entityTypeDisplayName: 'bokningar',
        defaultSortPropertyName: 'date',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        statusColumns: [
            {
                key: 'status',
                getValue: (booking: BookingViewModel) => getStatusName(booking.status),
                getColor: (booking: BookingViewModel) => getStatusColor(booking.status),
            },
        ],
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
                key: 'date',
                displayName: 'Datum',
                getValue: (booking: BookingViewModel) => booking.isoFormattedUsageStartString,
                getContentOverride: BookingUsageIntervalDisplayFn,
                getHeadingValue: showDateHeadings ? getBookingDateHeadingValue : undefined,
                columnWidth: 220,
            },
        ],
    };

    return (
        <Card className="mb-3">
            <Card.Header>
                <div className="d-flex justify-content-between">
                    {title}
                    {children}
                </div>
            </Card.Header>
            <TableDisplay
                entities={bookings.map(toBookingViewModel)}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
            />
        </Card>
    );
};

export default TinyBookingTable;
