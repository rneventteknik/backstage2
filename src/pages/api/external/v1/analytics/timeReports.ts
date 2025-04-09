import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../../../lib/apiResponses';
import { withApiKeyContext } from '../../../../../lib/sessionContext';
import { BookingViewModel } from '../../../../../models/interfaces';
import { toBooking } from '../../../../../lib/mappers/booking';
import { formatDatetimeForAnalyticsExport, toBookingViewModel } from '../../../../../lib/datetimeUtils';
import {
    getAccountKindName,
    getBookingTypeName,
    getGlobalSetting,
    getPricePlanName,
    getStatusName,
} from '../../../../../lib/utils';
import { AccountKind } from '../../../../../models/enums/AccountKind';
import { fetchSettings } from '../../../../../lib/db-access/setting';
import { fetchBookingsForAnalytics } from '../../../../../lib/db-access/booking';
import { getTimeReportPrice } from '../../../../../lib/pricingUtils';
import { PricePlan } from '../../../../../models/enums/PricePlan';

const handler = withApiKeyContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            const globalSettings = await fetchSettings();
            const defaultSalaryAccountExternal = getGlobalSetting(
                'accounts.defaultSalaryAccount.external',
                globalSettings,
            );
            const defaultSalaryAccountInternal = getGlobalSetting(
                'accounts.defaultSalaryAccount.internal',
                globalSettings,
            );
            const renumerationRatioThs = getGlobalSetting('salary.wageRatio.ths', globalSettings);
            const renumerationRatioExternal = getGlobalSetting('salary.wageRatio.external', globalSettings);
            await fetchBookingsForAnalytics()
                .then((x) => x.map(toBooking))
                .then((x) => x.map(toBookingViewModel))
                .then((x) =>
                    mapToAnalytics(
                        x,
                        defaultSalaryAccountExternal,
                        defaultSalaryAccountInternal,
                        renumerationRatioThs,
                        renumerationRatioExternal,
                    ),
                )
                .then((x) => mapToCSV(x))
                .then((result) => res.status(200).setHeader('Content-Type', 'text/csv').send(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));
            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

interface TimeReportsAnalyticsModel {
    id: number;
    userId: number;
    userName: string;
    actualWorkingHours: number;
    billableWorkingHours: number;
    startDatetime: string | null;
    endDatetime: string | null;
    pricePerHour: number;
    sortIndex: number;
    account: string;
    bookingId: number;
    bookingName: string;
    bookingStatus: string;
    bookingType: string;
    bookingPricePlan: string;
    bookingAccountKind: string;
    bookingFixedPrice: number | null;
    bookingInvoiceDate: string | null;
    totalPrice: number;
    renumerationRatio: number;
}

const mapToAnalytics = (
    bookings: BookingViewModel[],
    defaultSalaryAccountExternal: string,
    defaultSalaryAccountInternal: string,
    renumerationRatioThs: string,
    renumerationRatioExternal: string,
): TimeReportsAnalyticsModel[] => {
    const allTimeReports = bookings.flatMap((b) =>
        (b.timeReports ?? []).map((x) => ({
            entry: x,
            booking: b,
        })),
    );

    return allTimeReports.map((x) => ({
        id: x.entry.id,
        userId: x.entry.userId,
        userName: x.entry.user?.name ?? '',
        actualWorkingHours: x.entry.actualWorkingHours,
        billableWorkingHours: x.entry.billableWorkingHours,
        startDatetime: formatDatetimeForAnalyticsExport(x.entry.startDatetime),
        endDatetime: formatDatetimeForAnalyticsExport(x.entry.endDatetime),
        pricePerHour: x.entry.pricePerHour.value,
        sortIndex: x.entry.sortIndex,
        account:
            x.booking.accountKind === AccountKind.EXTERNAL
                ? defaultSalaryAccountExternal
                : defaultSalaryAccountInternal,
        bookingId: x.booking.id,
        bookingName: x.booking.name,
        bookingStatus: getStatusName(x.booking.status),
        bookingType: getBookingTypeName(x.booking.bookingType),
        bookingPricePlan: getPricePlanName(x.booking.pricePlan),
        bookingAccountKind: getAccountKindName(x.booking.accountKind),
        bookingFixedPrice: x.booking.fixedPrice,
        bookingInvoiceDate: x.booking.invoiceDate ? formatDatetimeForAnalyticsExport(x.booking.invoiceDate) : null,
        totalPrice: getTimeReportPrice(x.entry).value,
        renumerationRatio: parseFloat(
            x.booking.pricePlan === PricePlan.EXTERNAL ? renumerationRatioExternal : renumerationRatioThs,
        ),
    }));
};

const mapToCSV = (timeReports: TimeReportsAnalyticsModel[]) => {
    const headings = Object.keys(timeReports[0]);
    const headerRow = headings.join(',');

    const bookingRows = timeReports.map((booking) =>
        headings
            .map((fieldName) => JSON.stringify((booking as unknown as { [name: string]: string })[fieldName]))
            .map((value) => value.replace('\\"', '”'))
            .map((value) => (value == 'null' ? '' : value))
            .join(','),
    );

    return [headerRow, ...bookingRows].join('\r\n');
};

export default handler;
