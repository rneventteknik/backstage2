import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
    getPaymentStatusName,
    getSalaryStatusName,
    getStatusName,
    onlyUnique,
    reduceSumFn,
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
import { ClickToEdit } from '../utils/DoubleClickToEdit';
import FixedPriceStatusTag from '../utils/FixedPriceStatusTag';
import TableStyleLink from '../utils/TableStyleLink';
import { formatDateForForm, getBookingDateHeadingValue } from '../../lib/datetimeUtils';
import { addVAT, formatCurrency, getBookingPrice } from '../../lib/pricingUtils';
import CancelledIcon from '../utils/CancelledIcon';
import InternalReservationTag from '../utils/InternalReservationTag';

type Props = {
    bookings: BookingViewModel[];
    selectedBookingIds?: number[];
    allowEditInvoiceNumber?: boolean;
    showHeadings?: boolean;
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
    showHeadings = false,
}: Props) => {
    // Table display functions
    //
    const getRentalStatusString = (booking: BookingViewModel): string => {
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

        if (booking.bookingType === BookingType.GIG || booking.status === Status.CANCELED) {
            return '-';
        }

        return 'Inte utlämnad';
    };

    const bookingReferenceDisplayFn = (booking: BookingViewModel) => (
        <>
            <ClickToEdit
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
            </ClickToEdit>
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
                <TableStyleLink href={'/bookings/' + booking.id} className="mr-1">
                    {booking.name}
                </TableStyleLink>

                <BookingTypeTag booking={booking} className="mr-1" />
                <InternalReservationTag booking={booking} className="mr-1" />
                <FixedPriceStatusTag booking={booking} className="mr-1" />

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
                        <FontAwesomeIcon icon={faCircleInfo} className="mr-1" title="" />
                    </OverlayTrigger>
                ) : null}

                <p className="text-muted mb-0">{booking.customerName ?? '-'}</p>
                <p className="text-muted mb-0">{booking.ownerUser?.name ?? '-'}</p>
                <p className="text-muted mb-0 d-lg-none">{replaceEmptyStringWithNull(booking.invoiceNumber) ?? '-'}</p>
                <p className="text-muted mb-0 d-lg-none">{booking.displayUsageStartString ?? '-'}</p>
                <p className="text-muted mb-0">{formatCurrency(addVAT(getBookingPrice(booking)))}</p>
            </>
        );
    };

    const bookingStatusIsDone = (booking: BookingViewModel) => booking.status === Status.DONE;
    const bookingStatusIsCancelled = (booking: BookingViewModel) => booking.status === Status.CANCELED;
    const bookingStatusDisplayFn = (booking: BookingViewModel) => (
        <>
            {getStatusName(booking.status)}
            {bookingStatusIsDone(booking) ? <DoneIcon /> : null}
            {bookingStatusIsCancelled(booking) ? <CancelledIcon /> : null}
            <p className="mb-0 d-xl-none">{bookingRentalStatusDisplayFn(booking)}</p>
            <p className="mb-0 d-xl-none">{bookingPaymentStatusDisplayFn(booking)}</p>
            <p className="mb-0 d-xl-none">{bookingSalaryStatusDisplayFn(booking)}</p>
        </>
    );

    const bookingRentalStatusIsDone = (booking: BookingViewModel) => getRentalStatusString(booking) === 'Återlämnad';
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

            {bookingRentalStatusIsDone(booking) ? <DoneIcon /> : null}
        </>
    );

    const bookingPaymentStatusIsDone = (booking: BookingViewModel) =>
        booking.paymentStatus === PaymentStatus.PAID ||
        booking.paymentStatus === PaymentStatus.PAID_WITH_INVOICE ||
        booking.paymentStatus === PaymentStatus.PAID_WITH_CASH;
    const bookingPaymentStatusDisplayFn = (booking: BookingViewModel) => (
        <>
            {booking.status !== Status.CANCELED || booking.paymentStatus !== PaymentStatus.NOT_PAID
                ? getPaymentStatusName(booking.paymentStatus)
                : '-'}
            {bookingPaymentStatusIsDone(booking) ? <DoneIcon /> : null}
            {booking.invoiceDate ? <p className="text-muted mb-0">{formatDateForForm(booking.invoiceDate)}</p> : null}
        </>
    );

    const hasBillableTimeReportHours = (booking: BookingViewModel) =>
        (booking.timeReports?.map((x) => x.billableWorkingHours).reduce(reduceSumFn, 0) ?? 0) > 0;
    const bookingSalaryStatusIsDone = (booking: BookingViewModel) => booking.salaryStatus === SalaryStatus.SENT;
    const bookingSalaryStatusDisplayFn = (booking: BookingViewModel) => (
        <>
            {hasBillableTimeReportHours(booking) || booking.salaryStatus !== SalaryStatus.NOT_SENT
                ? getSalaryStatusName(booking.salaryStatus)
                : '-'}
            {bookingSalaryStatusIsDone(booking) ? <DoneIcon /> : null}
        </>
    );

    const bookingSelectionDisplayFn = (booking: BookingViewModel) => {
        if (!selectedBookingIds || !onToggleSelect) {
            throw new Error('Invalid table configuration');
        }

        return (isDisabled ? isDisabled(booking) : false) ? (
            <></>
        ) : (
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

    const getBookingDateHeadingValueWithDoneIcon = (value: string | null) => (
        <strong>
            {value}{' '}
            {bookings
                .filter((x) => getBookingDateHeadingValue(x) === value)
                .every(
                    (x) =>
                        x.status === Status.CANCELED ||
                        (bookingStatusIsDone(x) &&
                            (bookingRentalStatusIsDone(x) || x.bookingType === BookingType.GIG) &&
                            (bookingSalaryStatusIsDone(x) || !hasBillableTimeReportHours(x)) &&
                            bookingPaymentStatusIsDone(x)),
                ) ? (
                <DoneIcon />
            ) : null}
        </strong>
    );

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
                getContentOverride: bookingNameDisplayFn,
            },
            {
                key: 'date',
                displayName: 'Datum',
                getValue: (booking: BookingViewModel) => booking.isoFormattedUsageStartString,
                getHeadingValue: showHeadings ? getBookingDateHeadingValue : undefined,
                getHeadingContentOverride: showHeadings ? getBookingDateHeadingValueWithDoneIcon : undefined,
                cellHideSize: 'lg',
                columnWidth: 150,
                textAlignment: 'left',
            },
            {
                key: 'status',
                displayName: 'Bokningstatus',
                getValue: (booking: BookingViewModel) => getStatusName(booking.status),
                textAlignment: 'left',
                columnWidth: 155,
                getContentOverride: bookingStatusDisplayFn,
            },
            {
                key: 'rentalStatus',
                displayName: 'Utlämningsstatus',
                getValue: (booking: BookingViewModel) => getRentalStatusString(booking),
                textAlignment: 'left',
                cellHideSize: 'xl',
                columnWidth: 155,
                getContentOverride: bookingRentalStatusDisplayFn,
            },
            {
                key: 'paymentStatus',
                displayName: 'Betalningsstatus',
                getValue: (booking: BookingViewModel) => getPaymentStatusName(booking.paymentStatus),
                textAlignment: 'left',
                cellHideSize: 'xl',
                columnWidth: 155,
                getContentOverride: bookingPaymentStatusDisplayFn,
            },
            {
                key: 'salaryStatus',
                displayName: 'Timarvodesstatus',
                getValue: (booking: BookingViewModel) => getSalaryStatusName(booking.salaryStatus),
                textAlignment: 'left',
                cellHideSize: 'xl',
                columnWidth: 130,
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
