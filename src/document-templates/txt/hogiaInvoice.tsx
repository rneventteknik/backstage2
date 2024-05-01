import iconv from 'iconv-lite';
import { range } from '../../lib/utils';
import { InvoiceData, InvoiceRow, InvoiceRowType, PricedInvoiceRow } from '../../models/misc/Invoice';
import { BookingType } from '../../models/enums/BookingType';

enum HogiaRowType {
    ITEM = 1,
    TEXT = 2,
    TEMPORARY = 3,
    TEXT_WITH_PRICE = 4,
    SUM = 12,
}

export const getHogiaTxtInvoice = (invoiceData: InvoiceData, t: (key: string) => string): Buffer => {
    const formatInvoiceRow = (invoiceRow: InvoiceRow): string => {
        const invoiceRowTypeToHogiaRowTypeString = (invoiceRowType: InvoiceRowType): string => {
            switch (invoiceRowType) {
                case InvoiceRowType.ITEM:
                    return HogiaRowType.TEMPORARY.toString();
                case InvoiceRowType.ITEM_COMMENT:
                case InvoiceRowType.HEADING:
                    return HogiaRowType.TEXT.toString();
            }
        };

        const getRowFormat = (): Map<number, string> => {
            const currencyFormatOptions = { decimal: ',', symbol: '', separator: '' };
            switch (invoiceRow.rowType) {
                case InvoiceRowType.ITEM:
                    const pricedInvoiceRow = invoiceRow as PricedInvoiceRow;
                    return new Map([
                        [1, 'Fakturarad'],
                        [2, invoiceRowTypeToHogiaRowTypeString(invoiceRow.rowType)],
                        [4, pricedInvoiceRow.numberOfUnits?.toString() ?? ''],
                        [5, pricedInvoiceRow.pricePerUnit?.format(currencyFormatOptions) ?? ''],
                        [7, pricedInvoiceRow.text],
                        [8, pricedInvoiceRow.account ?? ''],
                        [12, pricedInvoiceRow.unit ?? ''],
                        [20, pricedInvoiceRow.rowPrice?.format(currencyFormatOptions) ?? ''],
                    ]);
                case InvoiceRowType.ITEM_COMMENT:
                    return new Map([
                        [1, 'Fakturarad'],
                        [2, invoiceRowTypeToHogiaRowTypeString(invoiceRow.rowType)],
                        [14, `| ${invoiceRow.text}`],
                    ]);
                case InvoiceRowType.HEADING:
                    return new Map([
                        [1, 'Fakturarad'],
                        [2, invoiceRowTypeToHogiaRowTypeString(invoiceRow.rowType)],
                        [14, `=== ${invoiceRow.text} ===`],
                    ]);
            }
        };

        const rowFormat = getRowFormat();

        const highestKey = Array.from(rowFormat.keys()).pop() ?? 0;

        const positions = range(1, highestKey + 1);

        return '\r' + positions.map((position) => rowFormat.get(position)).join('\t');
    };

    const formatHeader = (invoiceData: InvoiceData): string => {
        const invoiceCommentLines = [
            `${t(
                invoiceData.bookingType === BookingType.GIG
                    ? 'common.booking-info.booking-gig'
                    : 'common.booking-info.booking-rental',
            )}: ${invoiceData.name} ${invoiceData.dates}`,
        ];
        if (invoiceData.invoiceTag) {
            invoiceCommentLines.push(`${t('invoice.tag')}: ${invoiceData.invoiceTag}`);
        }
        invoiceCommentLines.push(
            `${t('hogia-invoice.general-information')} ${
                invoiceData.invoiceNumber ? invoiceData.invoiceNumber : `"${invoiceData.name}"`
            }`,
        );
        const invoiceComment = invoiceCommentLines.join('<CR>');
        const eInvoiceStatus = '0';
        const rowFormat = new Map([
            [1, 'Kundfaktura'],
            [5, invoiceData.customer.invoiceHogiaId],
            [10, invoiceData.dimension1],
            [13, invoiceData.ourReference],
            [15, invoiceData.templateName],
            [16, invoiceComment],
            [17, invoiceData.customer.theirReference],
            [26, invoiceData.customer.invoiceAddress?.replaceAll('\n', '<CR>')],
            [44, eInvoiceStatus],
        ]);

        const highestKey = Array.from(rowFormat.keys()).pop() ?? 0;

        const positions = range(1, highestKey + 1);

        return (
            `Rubrik\t${invoiceData.documentName}\r\n` +
            'Datumformat\tYYYY - MM - DD\r\n' +
            positions.map((position) => rowFormat.get(position)).join('\t')
        );
    };

    const formatFooter = () => {
        return '\r\nKundfaktura-Slut\r\n';
    };

    const txtInvoiceComponents = [
        formatHeader(invoiceData),
        ...invoiceData.invoiceRows.map(formatInvoiceRow),
        formatFooter(),
    ];
    const content = txtInvoiceComponents.join('');
    // Hogia requires 'ANSI' encoded text
    return iconv.encode(content, 'WINDOWS-1252');
};
