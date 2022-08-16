import iconv from 'iconv-lite';
import {
    getExtraDaysPrice,
    getHourlyPrice,
    getNumberOfDays,
    getTotalTimeReportsPrice,
    getUnitPrice,
} from '../../lib/pricingUtils';
import { getAccountKindInvoiceAccount, range } from '../../lib/utils';
import { AccountKind } from '../../models/enums/AccountKind';
import { BookingType } from '../../models/enums/BookingType';
import { BookingViewModel, TimeReport } from '../../models/interfaces';
import { EquipmentList, EquipmentListEntry } from '../../models/interfaces/EquipmentList';

enum RowType {
    ITEM = 1,
    TEXT = 2,
    TEMPORARY = 3,
    TEXT_WITH_PRICE = 4,
    SUM = 12,
}

export const getHogiaTxtInvoice = (booking: BookingViewModel, t: (t: string) => string): Buffer => {
    const lists = booking.equipmentLists ?? [];
    const equipmentLines = lists.flatMap((list) => [
        formatEquipmentList(list),
        ...list.equipmentListEntries.flatMap((entry) => formatEquipmentListEntry(entry, getNumberOfDays(list), t)),
    ]);
    const timeReportLines = [
        formatTimeReports(
            booking.timeReports?.filter((x) => x.accountKind == AccountKind.EXTERNAL),
            AccountKind.EXTERNAL,
            t,
        ),
        formatTimeReports(
            booking.timeReports?.filter((x) => x.accountKind == AccountKind.INTERNAL),
            AccountKind.INTERNAL,
            t,
        ),
    ];

    const invoiceLines = [formatHeader(booking, t), ...equipmentLines, ...timeReportLines, formatFooter()];
    const content = invoiceLines.join('');
    // Hogia requires 'ANSI' encoded text
    return iconv.encode(content, 'WINDOWS-1252');
};

const formatInvoiceRow = (
    rowType: RowType,
    name: string,
    numberOfUnits?: number,
    pricePerUnit?: number,
    discount?: number,
    account?: string,
    unit?: string,
): string => {
    const rowFormat = new Map([
        [1, 'Fakturarad'],
        [2, rowType.toString() ?? ''],
        [4, numberOfUnits?.toString() ?? ''],
        [5, pricePerUnit?.toString().replace('.', ',') ?? ''],
        [6, discount?.toString().replace('.', ',') ?? ''],
        [7, name ?? ''],
        [8, account ?? ''],
        [12, unit ?? ''],
    ]);

    const highestKey = Array.from(rowFormat.keys()).pop() ?? 0;

    const positions = range(1, highestKey + 1);

    return '\r' + positions.map((position) => rowFormat.get(position)).join('\t');
};

const formatEquipmentListEntry = (
    entry: EquipmentListEntry,
    numberOfDays: number,
    t: (t: string) => string,
): string => {
    const unitTextResourceKey = entry.numberOfUnits > 1 ? 'common.misc.count-unit' : 'common.misc.count-unit-single';

    return (
        formatInvoiceRow(
            RowType.TEMPORARY,
            entry.name,
            entry.numberOfUnits,
            getUnitPrice(entry, numberOfDays),
            0,
            process.env.INVOICE_DEFAULT_EQUPEMENT_ACCOUNT ?? '',
            t(unitTextResourceKey),
        ) +
        ((numberOfDays > 1 || entry.numberOfHours) && entry.pricePerUnit ? formatUnitPrices(entry, t) : '') +
        (numberOfDays > 1 && entry.pricePerUnit ? formatExtraDayPrice(entry, numberOfDays, t) : '') +
        (entry.numberOfHours ? formatHourlyPrice(entry, t) : '')
    );
};

const formatUnitPrices = (entry: EquipmentListEntry, t: (t: string) => string): string => {
    return formatInvoiceRow(RowType.TEXT, `  ${t('hogia-invoice.start-cost')}`, undefined, entry.pricePerUnit);
};

const formatExtraDayPrice = (entry: EquipmentListEntry, numberOfDays: number, t: (t: string) => string): string => {
    const dayCostResourceKey = numberOfDays - 1 > 1 ? 'hogia-invoice.day-cost' : 'hogia-invoice.day-cost-single';

    return formatInvoiceRow(
        RowType.TEXT,
        `  ${numberOfDays - 1} ${t(dayCostResourceKey)} `,
        undefined,
        getExtraDaysPrice(entry, numberOfDays),
    );
};

const formatHourlyPrice = (entry: EquipmentListEntry, t: (t: string) => string): string => {
    return formatInvoiceRow(
        RowType.TEXT,
        `  ${entry.numberOfHours} ${t('common.misc.hours-unit')}`,
        undefined,
        getHourlyPrice(entry),
    );
};

const formatTimeReports = (
    timeReports: TimeReport[] | undefined,
    accountKind: AccountKind,
    t: (t: string) => string,
): string => {
    const price = getTotalTimeReportsPrice(timeReports);

    if (!timeReports?.length) {
        return '';
    }

    return formatInvoiceRow(
        RowType.TEMPORARY,
        t('hogia-invoice.staff-cost'),
        1,
        price,
        0,
        getAccountKindInvoiceAccount(accountKind),
        t('common.misc.count-unit'),
    );
};

const formatEquipmentList = (list: EquipmentList): string => {
    return formatInvoiceRow(RowType.TEXT, list.name);
};
const formatHeader = (booking: BookingViewModel, t: (t: string) => string): string => {
    const bookingTypeTextResourceKey =
        booking.bookingType === BookingType.GIG
            ? 'common.booking-info.booking-gig'
            : 'common.booking-info.booking-rental';

    const invoiceComment =
        t(bookingTypeTextResourceKey) +
        ': ' +
        booking.name +
        ' ' +
        booking.displayStartDate +
        '<CR>' +
        t('hogia-invoice.general-information') +
        ' ' +
        (booking.invoiceNumber ?? '');

    const rowFormat = new Map([
        [1, 'Kundfaktura'],
        [5, booking.invoiceHogiaId?.toString() ?? '0'],
        [10, process.env.INVOICE_DIMENSION_1 ?? ''],
        [13, process.env.INVOICE_OUR_REFERENCE ?? ''],
        [16, invoiceComment],
        [17, booking.contactPersonName ?? ''],
        [26, booking.invoiceAddress?.replaceAll('\n', '<CR>') ?? ''],
        [44, '0'],
    ]);

    const highestKey = Array.from(rowFormat.keys()).pop() ?? 0;

    const positions = range(1, highestKey + 1);

    return (
        'Rubrik\tRN Faktura\r' +
        'Datumformat\tYYYY - MM - DD\r' +
        positions.map((position) => rowFormat.get(position)).join('\t')
    );
};

const formatFooter = () => {
    return '\rKundfaktura-slut';
};
