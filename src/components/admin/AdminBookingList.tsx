import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
    getPaymentStatusName,
    getSalaryStatusName,
    getStatusName,
    onlyUnique,
    replaceEmptyStringWithNull,
} from '../../lib/utils';
import { BookingType } from '../../models/enums/BookingType';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { RentalStatus } from '../../models/enums/RentalStatus';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import { Status } from '../../models/enums/Status';
import { BookingViewModel } from '../../models/interfaces';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import BookingTypeTag from '../utils/BookingTypeTag';
import DoneIcon from '../utils/DoneIcon';
import { DoubleClickToEdit } from '../utils/DoubleClickToEdit';
import FixedPriceStatusTag from '../utils/FixedPriceStatusTag';
import TableStyleLink from '../utils/TableStyleLink';

type Props = {
    bookings: BookingViewModel[];
    selectedBookingIds?: number[];
    allowEditInvoiceNumber?: boolean;
    updateInvoiceNumber?: (booking: BookingViewModel, newInvoiceNumber: string) => void;
    onToggleSelect?: (booking: BookingViewModel) => void;
    isDisabled?: (booking: BookingViewModel) => boolean;
    tableSettingsOverride?: Partial<TableConfiguration<BookingViewModel>>;
};

const AdminBookingList: React.FC<Props> = ({
    bookings,
    selectedBookingIds,
    updateInvoiceNumber,
    onToggleSelect,
    isDisabled,
    tableSettingsOverride,
    allowEditInvoiceNumber = false,
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

    const bookingReferenceDisplayFn = (booking: BookingViewModel) => (
        <>
            <DoubleClickToEdit
                readonly={!allowEditInvoiceNumber}
                onUpdate={(newInvoiceNumber: string) => {
                    if (!updateInvoiceNumber) {
                        throw new Error('Missing updateInvoiceNumber');
                    }
                    updateInvoiceNumber(booking, newInvoiceNumber);
                }}
                value={booking.invoiceNumber}
            >
                {replaceEmptyStringWithNull(booking.invoiceNumber) ?? <span className="text-muted">XXXXXXX</span>}
            </DoubleClickToEdit>
        </>
    );

    const bookingNameDisplayFn = (booking: BookingViewModel) => {
        const customAccountsOnBooking =
            booking.equipmentLists
                ?.flatMap((list) =>
                    [...list.listEntries, ...list.listHeadings.flatMap((heading) => heading.listEntries)].map(
                        (entry) => entry.account,
                    ),
                )
                .filter((x) => x !== null)
                .filter(onlyUnique) ?? [];

        return (
            <>
                <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>

                <BookingTypeTag booking={booking} className="ml-1" />
                <FixedPriceStatusTag booking={booking} className="ml-1" />

                {customAccountsOnBooking.length > 0 ? (
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="1">
                                <strong>
                                    Denna bokning har anpassade konton ({customAccountsOnBooking.join(', ')}).
                                </strong>
                            </Tooltip>
                        }
                    >
                        <FontAwesomeIcon icon={faCircleInfo} className="ml-1" title="" />
                    </OverlayTrigger>
                ) : null}

                <p className="text-muted mb-0">{booking.customerName ?? '-'}</p>
                <p className="text-muted mb-0">{booking.ownerUser?.name ?? '-'}</p>
                <p className="text-muted mb-0 d-lg-none">{replaceEmptyStringWithNull(booking.invoiceNumber) ?? '-'}</p>
                <p className="text-muted mb-0 d-lg-none">{booking.displayUsageStartString ?? '-'}</p>
            </>
        );
    };

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
            booking.paymentStatus === PaymentStatus.PAID_WITH_INVOICE ||
            booking.paymentStatus === PaymentStatus.PAID_WITH_CASH ? (
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
                getContentOverride: bookingReferenceDisplayFn,
                textTruncation: true,
                cellHideSize: 'lg',
                columnWidth: 110,
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
                getValue: (booking: BookingViewModel) => booking.isoFormattedUsageStartString,
                cellHideSize: 'lg',
                columnWidth: 150,
                textAlignment: 'left',
            },
            {
                key: 'status',
                displayName: 'Bokningstatus',
                getValue: (booking: BookingViewModel) => getStatusName(booking.status),
                textAlignment: 'left',
                columnWidth: 140,
                getContentOverride: bookingStatusDisplayFn,
            },
            {
                key: 'rentalStatus',
                displayName: 'Utlämningsstatus',
                getValue: (booking: BookingViewModel) => getRentalStatusString(booking),
                textAlignment: 'left',
                cellHideSize: 'xl',
                columnWidth: 140,
                getContentOverride: bookingRentalStatusDisplayFn,
            },
            {
                key: 'paymentStatus',
                displayName: 'Betalningsstatus',
                getValue: (booking: BookingViewModel) => getPaymentStatusName(booking.paymentStatus),
                textAlignment: 'left',
                cellHideSize: 'xl',
                columnWidth: 140,
                getContentOverride: bookingPaymentStatusDisplayFn,
            },
            {
                key: 'salaryStatus',
                displayName: 'Lönestatus',
                getValue: (booking: BookingViewModel) => getSalaryStatusName(booking.salaryStatus),
                textAlignment: 'left',
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
