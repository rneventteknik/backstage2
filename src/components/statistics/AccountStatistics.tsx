import React, { useState } from 'react';
import { BookingViewModel } from '../../models/interfaces';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { getGlobalSetting, getOperationalYear, groupBy } from '../../lib/utils';
import { Card, Modal } from 'react-bootstrap';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import { formatCurrency, formatNumberAsCurrency, getInvoiceRows } from '../../lib/pricingUtils';
import { InvoiceRowType, PricedInvoiceRow } from '../../models/misc/Invoice';
import { getSortedList } from '../../lib/sortIndexUtils';
import TableStyleLink from '../utils/TableStyleLink';
import { getTextResource } from '../../document-templates/useTextResources';
import { getTextResourcesFromGlobalSettings } from '../../document-templates/utils';
import currency from 'currency.js';

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
    january: AccountSumStatistic;
    february: AccountSumStatistic;
    march: AccountSumStatistic;
    april: AccountSumStatistic;
    may: AccountSumStatistic;
    june: AccountSumStatistic;
    july: AccountSumStatistic;
    august: AccountSumStatistic;
    september: AccountSumStatistic;
    october: AccountSumStatistic;
    november: AccountSumStatistic;
    december: AccountSumStatistic;
    yearTotal: AccountSumStatistic;
};

type AccountSumStatistic = {
    sum: currency;
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
        column:
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
            | 'december'
            | 'yearTotal',
    ) => {
        const statisticDisplayFn = (model: AccountStatistic) =>
            model[column].sum.value === 0 ? (
                <span className="text-muted">{formatNumberAsCurrency(0)}</span>
            ) : (
                <span onClick={() => setDetailsInvoiceRows(model[column].invoiceRows)} role="button">
                    {formatCurrency(model[column].sum)}
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
                getValue: (model: AccountStatistic) => model.july.sum.value,
                getContentOverride: getStatisticDisplayFn('july'),
                textAlignment: 'right',
            },
            {
                key: 'august',
                displayName: 'Aug',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.august.sum.value,
                getContentOverride: getStatisticDisplayFn('august'),
                textAlignment: 'right',
            },
            {
                key: 'september',
                displayName: 'Sep',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.september.sum.value,
                getContentOverride: getStatisticDisplayFn('september'),
                textAlignment: 'right',
            },
            {
                key: 'october',
                displayName: 'Oct',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.october.sum.value,
                getContentOverride: getStatisticDisplayFn('october'),
                textAlignment: 'right',
            },
            {
                key: 'november',
                displayName: 'Nov',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.november.sum.value,
                getContentOverride: getStatisticDisplayFn('november'),
                textAlignment: 'right',
            },
            {
                key: 'december',
                displayName: 'Dec',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.december.sum.value,
                getContentOverride: getStatisticDisplayFn('december'),
                textAlignment: 'right',
            },
            {
                key: 'january',
                displayName: 'Jan',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.january.sum.value,
                getContentOverride: getStatisticDisplayFn('january'),
                textAlignment: 'right',
            },
            {
                key: 'february',
                displayName: 'Feb',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.february.sum.value,
                getContentOverride: getStatisticDisplayFn('february'),
                textAlignment: 'right',
            },
            {
                key: 'march',
                displayName: 'Mar',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.march.sum.value,
                getContentOverride: getStatisticDisplayFn('march'),
                textAlignment: 'right',
            },
            {
                key: 'april',
                displayName: 'Apr',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.april.sum.value,
                getContentOverride: getStatisticDisplayFn('april'),
                textAlignment: 'right',
            },
            {
                key: 'may',
                displayName: 'Maj',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.may.sum.value,
                getContentOverride: getStatisticDisplayFn('may'),
                textAlignment: 'right',
            },
            {
                key: 'june',
                displayName: 'Jun',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.june.sum.value,
                getContentOverride: getStatisticDisplayFn('june'),
                textAlignment: 'right',
            },
            {
                key: 'total',
                displayName: 'Total',
                columnWidth: 90,
                getValue: (model: AccountStatistic) => model.yearTotal.sum.value,
                getContentOverride: getStatisticDisplayFn('yearTotal'),
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
    const defaultFixedPriceAccountExternal = getGlobalSetting(
        'accounts.defaultFixedPriceAccount.external',
        globalSettings,
    );

    const invoiceRows = bookings.flatMap((bookingViewModel) => {
        const t = (key: string): string =>
            getTextResource(key, bookingViewModel.language, getTextResourcesFromGlobalSettings(globalSettings));

        return getInvoiceRows(
            bookingViewModel,
            defaultEquipmentAccountExternal,
            defaultEquipmentAccountInternal,
            defaultSalaryAccountExternal,
            defaultSalaryAccountInternal,
            defaultFixedPriceAccountExternal,
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
            january: getAccountSumForMonth(invoiceRowsForAccount, 0),
            february: getAccountSumForMonth(invoiceRowsForAccount, 1),
            march: getAccountSumForMonth(invoiceRowsForAccount, 2),
            april: getAccountSumForMonth(invoiceRowsForAccount, 3),
            may: getAccountSumForMonth(invoiceRowsForAccount, 4),
            june: getAccountSumForMonth(invoiceRowsForAccount, 5),
            july: getAccountSumForMonth(invoiceRowsForAccount, 6),
            august: getAccountSumForMonth(invoiceRowsForAccount, 7),
            september: getAccountSumForMonth(invoiceRowsForAccount, 8),
            october: getAccountSumForMonth(invoiceRowsForAccount, 9),
            november: getAccountSumForMonth(invoiceRowsForAccount, 10),
            december: getAccountSumForMonth(invoiceRowsForAccount, 11),
            yearTotal: getYearTotal(invoiceRowsForAccount),
        });
    }

    return accountStatistics;
};

const getAccountSumForMonth = (invoiceRows: PricedInvoiceRowWithBooking[], month: number) => {
    const invoiceRowsForMonth = invoiceRows.filter((x) => x.booking.usageStartDatetime?.getMonth() === month);

    return {
        sum: invoiceRowsForMonth.map((x) => x.rowPrice).reduce((a, b) => a.add(b), currency(0)),
        invoiceRows: invoiceRowsForMonth,
    };
};

const getYearTotal = (invoiceRows: PricedInvoiceRowWithBooking[]) => {
    return {
        sum: invoiceRows.map((x) => x.rowPrice).reduce((a, b) => a.add(b), currency(0)),
        invoiceRows: invoiceRows,
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
                getValue: (model: PricedInvoiceRowWithBooking) => model.rowPrice.value,
                getContentOverride: (model: PricedInvoiceRowWithBooking) => formatCurrency(model.rowPrice),
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
