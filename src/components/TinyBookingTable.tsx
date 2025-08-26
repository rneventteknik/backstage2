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
import CollapsibleCard from './utils/CollapsibleCard';

type Props = {
    title: string;
    bookings: Booking[] | undefined;
    tableSettingsOverride?: Partial<TableConfiguration<BookingViewModel>>;
    showDateHeadings?: boolean;
    children?: React.ReactNode;
    collapsible?: boolean;
    defaultOpen?: boolean;
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
    collapsible = false,
    defaultOpen = true,
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


    const CardWrapper = ({ children: tableChildren }: { children: React.ReactNode }) =>
        collapsible ? (
            <CollapsibleCard title={title} defaultOpen={defaultOpen}>
                {tableChildren}
            </CollapsibleCard>
        ) : (
            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex justify-content-between">
                        {title}
                        {children}
                    </div>
                </Card.Header>
                {tableChildren}
            </Card>
        );

    return (
        <CardWrapper>
            <TableDisplay
                entities={bookings.map(toBookingViewModel)}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
            />
        </CardWrapper>
    );
};

export default TinyBookingTable;
