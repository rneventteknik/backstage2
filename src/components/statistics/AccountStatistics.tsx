import React, { useState } from 'react';
import { BookingViewModel } from '../../models/interfaces';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { getGlobalSetting, getOperationalYear, groupBy, reduceSumFn } from '../../lib/utils';
import { Card, Modal } from 'react-bootstrap';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import { formatNumberAsCurrency, getInvoiceRows } from '../../lib/pricingUtils';
import { InvoiceRowType, PricedInvoiceRow } from '../../models/misc/Invoice';
import { getSortedList } from '../../lib/sortIndexUtils';
import TableStyleLink from '../utils/TableStyleLink';
import { getTextResource } from '../../document-templates/useTextResources';
import { getTextResourcesFromGlobalSettings } from '../../document-templates/utils';

type Props = {
    bookings: BookingViewModel[];
    globalSettings: KeyValue[];
};

type PricedInvoiceRowWithBooking = PricedInvoiceRow & { booking: BookingViewModel; id: string };

type YearlyStatistic = {
    label: string;
    id: number;
    sortIndex: number;
    bookings: BookingViewModel[];
    invoiceRows: PricedInvoiceRowWithBooking[];
    accountStatistics: AccountStatistic[];
};

type AccountStatistic = {
    label: string;
    id: number;
    january: AccountMonthStatistic;
    february: AccountMonthStatistic;
    march: AccountMonthStatistic;
    april: AccountMonthStatistic;
    may: AccountMonthStatistic;
    june: AccountMonthStatistic;
    july: AccountMonthStatistic;
    august: AccountMonthStatistic;
    september: AccountMonthStatistic;
    october: AccountMonthStatistic;
    november: AccountMonthStatistic;
    december: AccountMonthStatistic;
};

type AccountMonthStatistic = {
    sum: number;
    invoiceRows: PricedInvoiceRowWithBooking[];
};

const AccountStatistics: React.FC<Props> = ({ bookings, globalSettings }: Props) => {
    const [detailsInvoiceRows, setDetailsInvoiceRows] = useState<PricedInvoiceRowWithBooking[] | null>(null);

    // Prepare data to calculate statistics
    //
    const bookingsByYear = groupBy(bookings, (booking) => getOperationalYear(booking.usageStartDatetime));
    const yearlyStatistics: YearlyStatistic[] = [];
    for (const statisticalYear in bookingsByYear) {
        const bookingsForYear = bookingsByYear[statisticalYear];
        const invoiceRowsForYear = getInvoiceRowsForBookings(bookingsForYear, globalSettings);

        yearlyStatistics.push({
            label: statisticalYear,
            id: yearlyStatistics.length + 1,
            sortIndex: -(bookingsForYear[0].usageEndDatetime?.getTime() ?? 0), // User the time of one of the bookings for sorting
            bookings: bookingsForYear,
            invoiceRows: invoiceRowsForYear,
            accountStatistics: getAccountsForInvoiceRows(invoiceRowsForYear),
        });
    }

    const sortedStatistics = getSortedList(yearlyStatistics);

    // Table display helpers
    //
    const getStatisticDisplayFn = (
        month:
            | 'january'
            | 'february'
            | 'march'
            | 'april'
            | 'may'
            | 'june'
            | 'july'
            | 'august'
            | 'september'
            | 'october'
            | 'november'
            | 'december',
    ) => {
        const statisticDisplayFn = (model: AccountStatistic) =>
            model[month].sum === 0 ? (
                <span className="text-muted">{formatNumberAsCurrency(0)}</span>
            ) : (
                <span onClick={() => setDetailsInvoiceRows(model[month].invoiceRows)} role="button">
                    {formatNumberAsCurrency(model[month].sum)}
                </span>
            );

        return statisticDisplayFn;
    };

    const tableSettings: TableConfiguration<AccountStatistic> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'name',
        defaultSortAscending: false,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Konto',
                getValue: (model: AccountStatistic) => model.label,
            },

            {
                key: 'july',
                displayName: 'Jul',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.july.sum,
                getContentOverride: getStatisticDisplayFn('july'),
                textAlignment: 'right',
            },
            {
                key: 'august',
                displayName: 'Aug',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.august.sum,
                getContentOverride: getStatisticDisplayFn('august'),
                textAlignment: 'right',
            },
            {
                key: 'september',
                displayName: 'Sep',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.september.sum,
                getContentOverride: getStatisticDisplayFn('september'),
                textAlignment: 'right',
            },
            {
                key: 'october',
                displayName: 'Oct',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.october.sum,
                getContentOverride: getStatisticDisplayFn('october'),
                textAlignment: 'right',
            },
            {
                key: 'november',
                displayName: 'Nov',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.november.sum,
                getContentOverride: getStatisticDisplayFn('november'),
                textAlignment: 'right',
            },
            {
                key: 'december',
                displayName: 'Dec',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.december.sum,
                getContentOverride: getStatisticDisplayFn('december'),
                textAlignment: 'right',
            },
            {
                key: 'january',
                displayName: 'Jan',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.january.sum,
                getContentOverride: getStatisticDisplayFn('january'),
                textAlignment: 'right',
            },
            {
                key: 'february',
                displayName: 'Feb',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.february.sum,
                getContentOverride: getStatisticDisplayFn('february'),
                textAlignment: 'right',
            },
            {
                key: 'march',
                displayName: 'Mar',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.march.sum,
                getContentOverride: getStatisticDisplayFn('march'),
                textAlignment: 'right',
            },
            {
                key: 'april',
                displayName: 'Apr',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.april.sum,
                getContentOverride: getStatisticDisplayFn('april'),
                textAlignment: 'right',
            },
            {
                key: 'may',
                displayName: 'Maj',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.may.sum,
                getContentOverride: getStatisticDisplayFn('may'),
                textAlignment: 'right',
            },
            {
                key: 'june',
                displayName: 'Jun',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.june.sum,
                getContentOverride: getStatisticDisplayFn('june'),
                textAlignment: 'right',
            },
        ],
    };

    return (
        <>
            {sortedStatistics.map((x) => (
                <Card className="mb-3 mt-3" key={x.id}>
                    <Card.Header>
                        <span onClick={() => setDetailsInvoiceRows(x.invoiceRows)} role="button">
                            {x.label}
                        </span>
                    </Card.Header>
                    <TableDisplay entities={x.accountStatistics} configuration={tableSettings} />
                </Card>
            ))}
            <AccountStatisticDetailsModal
                invoiceRows={detailsInvoiceRows ?? []}
                show={detailsInvoiceRows !== null}
                onHide={() => setDetailsInvoiceRows(null)}
            />
        </>
    );
};

const getInvoiceRowsForBookings = (
    bookings: BookingViewModel[],
    globalSettings: KeyValue[],
): PricedInvoiceRowWithBooking[] => {
    const defaultEquipmentAccountExternal = getGlobalSetting(
        'accounts.defaultEquipmentAccount.external',
        globalSettings,
    );
    const defaultEquipmentAccountInternal = getGlobalSetting(
        'accounts.defaultEquipmentAccount.internal',
        globalSettings,
    );
    const defaultSalaryAccountExternal = getGlobalSetting('accounts.defaultSalaryAccount.external', globalSettings);
    const defaultSalaryAccountInternal = getGlobalSetting('accounts.defaultSalaryAccount.internal', globalSettings);

    const invoiceRows = bookings.flatMap((bookingViewModel) => {
        const t = (key: string): string =>
            getTextResource(key, bookingViewModel.language, getTextResourcesFromGlobalSettings(globalSettings));

        return getInvoiceRows(
            bookingViewModel,
            defaultEquipmentAccountExternal,
            defaultEquipmentAccountInternal,
            defaultSalaryAccountExternal,
            defaultSalaryAccountInternal,
            t,
        )
            .filter((x) => x.rowType === InvoiceRowType.ITEM)
            .map((x) => ({
                ...(x as PricedInvoiceRow),
                booking: bookingViewModel,
                id: (x as PricedInvoiceRow).sourceId,
            }));
    });
    return invoiceRows;
};

const getAccountsForInvoiceRows = (invoiceRows: PricedInvoiceRowWithBooking[]): AccountStatistic[] => {
    const invoiceRowsByAccount = groupBy(invoiceRows, (x) => x.account);
    const accountStatistics: AccountStatistic[] = [];
    for (const account in invoiceRowsByAccount) {
        const invoiceRowsForAccount = invoiceRowsByAccount[account];

        accountStatistics.push({
            label: account,
            id: accountStatistics.length + 1,
            january: getAccountForMonth(invoiceRowsForAccount, 0),
            february: getAccountForMonth(invoiceRowsForAccount, 1),
            march: getAccountForMonth(invoiceRowsForAccount, 2),
            april: getAccountForMonth(invoiceRowsForAccount, 3),
            may: getAccountForMonth(invoiceRowsForAccount, 4),
            june: getAccountForMonth(invoiceRowsForAccount, 5),
            july: getAccountForMonth(invoiceRowsForAccount, 6),
            august: getAccountForMonth(invoiceRowsForAccount, 7),
            september: getAccountForMonth(invoiceRowsForAccount, 8),
            october: getAccountForMonth(invoiceRowsForAccount, 9),
            november: getAccountForMonth(invoiceRowsForAccount, 10),
            december: getAccountForMonth(invoiceRowsForAccount, 11),
        });
    }

    return accountStatistics;
};

const getAccountForMonth = (invoiceRows: PricedInvoiceRowWithBooking[], month: number) => {
    const invoiceRowsForMonth = invoiceRows.filter((x) => x.booking.usageStartDatetime?.getMonth() === month);

    return {
        sum: invoiceRowsForMonth.map((x) => x.rowPrice).reduce(reduceSumFn, 0),
        invoiceRows: invoiceRowsForMonth,
    };
};

// Details modal component
//
type AccountStatisticDetailsModalProps = {
    show: boolean;
    onHide: () => void;
    invoiceRows: PricedInvoiceRowWithBooking[];
};

const AccountStatisticDetailsModal: React.FC<AccountStatisticDetailsModalProps> = ({
    show,
    onHide,
    invoiceRows,
}: AccountStatisticDetailsModalProps) => {
    const BookingNameDisplayFn = (invoiceRow: PricedInvoiceRowWithBooking) => (
        <>
            <TableStyleLink href={'/bookings/' + invoiceRow.booking.id}>{invoiceRow.booking.name}</TableStyleLink>
        </>
    );

    const tableSettings: TableConfiguration<PricedInvoiceRowWithBooking> = {
        entityTypeDisplayName: '',
        noResultsLabel: 'Inga rader',
        defaultSortPropertyName: 'name',
        defaultSortAscending: false,
        columns: [
            {
                key: 'account',
                displayName: 'Konto',
                getValue: (model: PricedInvoiceRowWithBooking) => model.account,
                columnWidth: 80,
            },
            {
                key: 'name',
                displayName: 'Bokning',
                getValue: (model: PricedInvoiceRowWithBooking) => model.booking.name,
                getContentOverride: BookingNameDisplayFn,
                textTruncation: true,
                columnWidth: 250,
            },
            {
                key: 'row',
                displayName: 'Rad',
                getValue: (model: PricedInvoiceRowWithBooking) => model.text,
            },
            {
                key: 'date',
                displayName: 'Bokningens slutdatum',
                getValue: (model: PricedInvoiceRowWithBooking) => model.booking.isoFormattedUsageEndString,
                columnWidth: 170,
            },
            {
                key: 'amount',
                displayName: 'Summa',
                getValue: (model: PricedInvoiceRowWithBooking) => model.rowPrice,
                getContentOverride: (model: PricedInvoiceRowWithBooking) => formatNumberAsCurrency(model.rowPrice),
                textAlignment: 'right',
                columnWidth: 140,
            },
        ],
    };
    return (
        <Modal show={show} onHide={() => onHide()} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Detaljer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <TableDisplay entities={invoiceRows} configuration={tableSettings} />
            </Modal.Body>
        </Modal>
    );
};

export default AccountStatistics;
