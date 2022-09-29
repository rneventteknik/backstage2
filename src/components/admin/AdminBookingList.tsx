import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getPaymentStatusName, getSalaryStatusName, getStatusName, replaceEmptyStringWithNull } from '../../lib/utils';
import { BookingType } from '../../models/enums/BookingType';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { RentalStatus } from '../../models/enums/RentalStatus';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import { Status } from '../../models/enums/Status';
import { BookingViewModel } from '../../models/interfaces';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import BookingTypeTag from '../utils/BookingTypeTag';
import DoneIcon from '../utils/DoneIcon';
import TableStyleLink from '../utils/TableStyleLink';

type Props = {
    bookings: BookingViewModel[];
    selectedBookingIds?: number[];
    onToggleSelect?: (booking: BookingViewModel) => void;
    isDisabled?: (booking: BookingViewModel) => boolean;
    tableSettingsOverride?: Partial<TableConfiguration<BookingViewModel>>;
};

const AdminBookingList: React.FC<Props> = ({
    bookings,
    selectedBookingIds,
    onToggleSelect,
    isDisabled,
    tableSettingsOverride,
}: Props) => {
    // Table display functions
    //
    const getRentalStatusString = (booking: BookingViewModel): string | number | Date => {
        if (booking.equipmentLists?.every((l) => l.rentalStatus === RentalStatus.RETURNED)) {
            return 'Återlämnad';
        }

        if (booking.equipmentLists?.some((l) => l.rentalStatus === RentalStatus.RETURNED)) {
            return 'Delvis återlämnad';
        }

        if (booking.equipmentLists?.every((l) => l.rentalStatus === RentalStatus.OUT)) {
            return 'Utlämnad';
        }

        if (booking.equipmentLists?.some((l) => l.rentalStatus === RentalStatus.OUT)) {
            return 'Delvis utlämnad';
        }

        if (booking.bookingType === BookingType.GIG) {
            return '-';
        }

        return 'Inte utlämnad';
    };

    const bookingNameDisplayFn = (booking: BookingViewModel) => (
        <>
            <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>

            <BookingTypeTag booking={booking} className="ml-1" />
            <p className="text-muted mb-0">{booking.customerName ?? '-'}</p>
            <p className="text-muted mb-0">{booking.ownerUser?.name ?? '-'}</p>
            <p className="text-muted mb-0 d-lg-none">{replaceEmptyStringWithNull(booking.invoiceNumber) ?? '-'}</p>
            <p className="text-muted mb-0 d-lg-none">{booking.displayUsageStartString ?? '-'}</p>
        </>
    );

    const bookingStatusDisplayFn = (booking: BookingViewModel) => (
        <>
            {getStatusName(booking.status)}
            {booking.status === Status.DONE ? <DoneIcon /> : null}
            <p className="mb-0 d-xl-none">{bookingRentalStatusDisplayFn(booking)}</p>
            <p className="mb-0 d-xl-none">{bookingPaymentStatusDisplayFn(booking)}</p>
            <p className="mb-0 d-xl-none">{bookingSalaryStatusDisplayFn(booking)}</p>
        </>
    );

    const bookingRentalStatusDisplayFn = (booking: BookingViewModel) => (
        <>
            {getRentalStatusString(booking)}
            {booking.returnalNote !== '' && booking.returnalNote ? (
                <OverlayTrigger placement="top" overlay={<Tooltip id="1">{booking.returnalNote}</Tooltip>}>
                    <span>
                        <FontAwesomeIcon icon={faCircleInfo} className="ml-2" />
                    </span>
                </OverlayTrigger>
            ) : null}

            {getRentalStatusString(booking) === 'Återlämnad' ? <DoneIcon /> : null}
        </>
    );

    const bookingPaymentStatusDisplayFn = (booking: BookingViewModel) => (
        <>
            {getPaymentStatusName(booking.paymentStatus)}
            {booking.paymentStatus === PaymentStatus.PAID ||
            booking.paymentStatus === PaymentStatus.PAID_WITH_INVOICE ? (
                <DoneIcon />
            ) : null}
        </>
    );

    const bookingSalaryStatusDisplayFn = (booking: BookingViewModel) => (
        <>
            {getSalaryStatusName(booking.salaryStatus)}
            {booking.salaryStatus === SalaryStatus.SENT ? <DoneIcon /> : null}
        </>
    );

    const bookingSelectionDisplayFn = (booking: BookingViewModel) => {
        if (!selectedBookingIds || !onToggleSelect) {
            throw new Error('Invalid table configuration');
        }

        return (
            <div className="text-center">
                <input
                    type="checkbox"
                    disabled={isDisabled ? isDisabled(booking) : false}
                    checked={selectedBookingIds.some((x) => x === booking.id)}
                    onChange={() => onToggleSelect(booking)}
                />
            </div>
        );
    };

    const bookingSelectionHeaderDisplayFn = (bookings: BookingViewModel[]) => {
        if (!selectedBookingIds || !onToggleSelect) {
            throw new Error('Invalid table configuration');
        }

        const allBoookingsAreSelected = bookings
            .filter((b) => !isDisabled || !isDisabled(b))
            .every((b) => selectedBookingIds.includes(b.id));

        const allBoookingsAreDisabled = isDisabled ? bookings.every((b) => isDisabled(b)) : false;

        const selectAllUnselected = () =>
            bookings
                .filter((b) => !selectedBookingIds.includes(b.id) && (!isDisabled || !isDisabled(b)))
                .forEach((b) => onToggleSelect(b));

        const unSelectAllSelected = () =>
            bookings.filter((b) => selectedBookingIds.includes(b.id)).forEach((b) => onToggleSelect(b));

        return (
            <div className="text-center">
                <input
                    type="checkbox"
                    disabled={allBoookingsAreDisabled}
                    checked={allBoookingsAreSelected && !allBoookingsAreDisabled}
                    onChange={() => (allBoookingsAreSelected ? unSelectAllSelected() : selectAllUnselected())}
                />
            </div>
        );
    };

    const tableSettings: TableConfiguration<BookingViewModel> = {
        entityTypeDisplayName: 'bokningar',
        defaultSortPropertyName: 'date',
        defaultSortAscending: false,
        columns: [
            {
                key: 'reference',
                displayName: 'Referens',
                getValue: (booking: BookingViewModel) => booking.invoiceNumber,
                textTruncation: true,
                cellHideSize: 'lg',
                columnWidth: 90,
            },
            {
                key: 'name',
                displayName: 'Bokning',
                getValue: (booking: BookingViewModel) => booking.name,
                textTruncation: true,
                getContentOverride: bookingNameDisplayFn,
            },
            {
                key: 'date',
                displayName: 'Datum',
                getValue: (booking: BookingViewModel) => booking.displayUsageStartString,
                cellHideSize: 'lg',
                columnWidth: 90,
                textAlignment: 'left',
            },
            {
                key: 'status',
                displayName: 'Bokningstatus',
                getValue: (booking: BookingViewModel) => getStatusName(booking.status),
                textAlignment: 'right',
                columnWidth: 170,
                getContentOverride: bookingStatusDisplayFn,
            },
            {
                key: 'rentalStatus',
                displayName: 'Utlämningsstatus',
                getValue: (booking: BookingViewModel) => getRentalStatusString(booking),
                textAlignment: 'right',
                cellHideSize: 'xl',
                columnWidth: 170,
                getContentOverride: bookingRentalStatusDisplayFn,
            },
            {
                key: 'paymentStatus',
                displayName: 'Betalningsstatus',
                getValue: (booking: BookingViewModel) => getPaymentStatusName(booking.paymentStatus),
                textAlignment: 'right',
                cellHideSize: 'xl',
                columnWidth: 170,
                getContentOverride: bookingPaymentStatusDisplayFn,
            },
            {
                key: 'salaryStatus',
                displayName: 'Lönestatus',
                getValue: (booking: BookingViewModel) => getSalaryStatusName(booking.salaryStatus),
                textAlignment: 'right',
                cellHideSize: 'xl',
                columnWidth: 120,
                getContentOverride: bookingSalaryStatusDisplayFn,
            },
        ],
    };

    // Add selection column in enabled
    if (selectedBookingIds) {
        tableSettings.columns = [
            {
                key: 'selection',
                displayName: '',
                getValue: () => '',
                getContentOverride: bookingSelectionDisplayFn,
                getHeaderOverride: bookingSelectionHeaderDisplayFn,
                columnWidth: 60,
                disableSort: true,
            },
            ...tableSettings.columns,
        ];
    }

    return <TableDisplay entities={bookings} configuration={{ ...tableSettings, ...tableSettingsOverride }} />;
};

export default AdminBookingList;