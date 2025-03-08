import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../../../lib/apiResponses';
import { withApiKeyContext } from '../../../../../lib/sessionContext';
import { getCalculatedDiscount, getPrice } from '../../../../../lib/pricingUtils';
import { BookingViewModel } from '../../../../../models/interfaces';
import { toBooking } from '../../../../../lib/mappers/booking';
import {
    formatDatetimeForAnalyticsExport,
    getEquipmentInDatetime,
    getEquipmentOutDatetime,
    getNumberOfDays,
    toBookingViewModel,
} from '../../../../../lib/datetimeUtils';
import { getAccountKindName, getBookingTypeName, getGlobalSetting, getPricePlanName, getStatusName } from '../../../../../lib/utils';
import { AccountKind } from '../../../../../models/enums/AccountKind';
import { fetchSettings } from '../../../../../lib/db-access/setting';
import { fetchBookingsForAnalytics } from '../../../../../lib/db-access/booking';

const handler = withApiKeyContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            const globalSettings = await fetchSettings();
            const defaultEquipmentAccountExternal = getGlobalSetting(
                'accounts.defaultEquipmentAccount.external',
                globalSettings,
            );
            const defaultEquipmentAccountInternal = getGlobalSetting(
                'accounts.defaultEquipmentAccount.internal',
                globalSettings,
            );
            await fetchBookingsForAnalytics()
                .then((x) => x.map(toBooking))
                .then((x) => x.map(toBookingViewModel))
                .then((x) => mapToAnalytics(x, defaultEquipmentAccountExternal, defaultEquipmentAccountInternal))
                .then((x) => mapToCSV(x))
                .then((result) => res.status(200).setHeader('Content-Type', 'text/csv').send(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));
            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

interface EquipmentUsageAnalyticsModel {
    id: number;
    name: string;
    equipmentListEntryCreated: string | null;
    equipmentId: number | null;
    equipmentName: string;
    equipmentPublicCategory: string | null;
    equipmentTags: string | null;
    numberOfUnits: number;
    numberOfHours: number;
    pricePerUnit: number;
    pricePerHour: number;
    equipmentPriceName: string | null;
    discountFixed: number;
    discountPercentage: number;
    totalDiscount: number;
    totalPrice: number;
    account: string;
    bookingId: number;
    bookingName: string;
    bookingStatus: string;
    bookingType: string;
    bookingPricePlan: string;
    bookingAccountKind: string;
    bookingFixedPrice: number | null;
    equipmentOutDatetime: string | null;
    equipmentInDatetime: string | null;
    usageStartDatetime: string | null;
    usageEndDatetime: string | null;
    equipmentListName: string;
    equipmentListId: number;
}

const mapToAnalytics = (
    bookings: BookingViewModel[],
    defaultEquipmentAccountExternal: string,
    defaultEquipmentAccountInternal: string,
): EquipmentUsageAnalyticsModel[] => {
    const allEquipmentEntries = bookings.flatMap((b) =>
        (b.equipmentLists ?? []).flatMap((l) =>
            [...l.listEntries, ...l.listHeadings.flatMap((x) => x.listEntries ?? [])].map((x) => ({
                entry: x,
                list: l,
                booking: b,
            })),
        ),
    );
    return allEquipmentEntries.map((x) => ({
        id: x.entry.id,
        name: x.entry.name,
        equipmentListEntryCreated: formatDatetimeForAnalyticsExport(x.entry.created),
        equipmentId: x.entry.equipmentId ?? null,
        equipmentName: x.entry.equipment?.name ?? x.entry.name,
        equipmentPublicCategory: x.entry.equipment?.equipmentPublicCategory?.name ?? null,
        equipmentTags: x.entry.equipment?.tags?.map((t) => t.name).join(', ') ?? null,
        numberOfUnits: x.entry.numberOfUnits,
        numberOfHours: x.entry.numberOfHours,
        pricePerUnit: x.entry.pricePerUnit.value,
        pricePerHour: x.entry.pricePerHour.value,
        equipmentPriceName: x.entry.equipmentPrice?.name ?? null,
        discountFixed: getCalculatedDiscount(x.entry, getNumberOfDays(x.list), 0).value,
        discountPercentage: x.list.discountPercentage,
        totalDiscount: getCalculatedDiscount(x.entry, getNumberOfDays(x.list), x.list.discountPercentage).value,
        totalPrice: getPrice(x.entry, getNumberOfDays(x.list), x.list.discountPercentage).value,
        account:
            x.entry.account ??
            (x.booking.accountKind === AccountKind.EXTERNAL
                ? defaultEquipmentAccountExternal
                : defaultEquipmentAccountInternal),
        bookingId: x.booking.id,
        bookingName: x.booking.name,
        bookingStatus: getStatusName(x.booking.status),
        bookingType: getBookingTypeName(x.booking.bookingType),
        bookingPricePlan: getPricePlanName(x.booking.pricePlan),
        bookingAccountKind: getAccountKindName(x.booking.accountKind),
        bookingFixedPrice: x.booking.fixedPrice,
        equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(x.list)),
        equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(x.list)),
        usageStartDatetime: formatDatetimeForAnalyticsExport(x.list.usageStartDatetime),
        usageEndDatetime: formatDatetimeForAnalyticsExport(x.list.usageEndDatetime),
        equipmentListName: x.list.name,
        equipmentListId: x.list.id,
    }));
};

const mapToCSV = (equipmentUsage: EquipmentUsageAnalyticsModel[]) => {
    const headings = Object.keys(equipmentUsage[0]);
    const headerRow = headings.join(',');

    const bookingRows = equipmentUsage.map((booking) =>
        headings
            .map((fieldName) => JSON.stringify((booking as unknown as { [name: string]: string })[fieldName]))
            .map((value) => value.replace('\\"', '”'))
            .map((value) => (value == 'null' ? '' : value))
            .join(','),
    );

    return [headerRow, ...bookingRows].join('\r\n');
};

export default handler;
