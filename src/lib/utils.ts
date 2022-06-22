import { BaseEntity, HasId } from '../models/interfaces/BaseEntity';
import { MemberStatus } from '../models/enums/MemberStatus';
import { Role } from '../models/enums/Role';
import { Status } from '../models/enums/Status';
import { PricePlan } from '../models/enums/PricePlan';
import { AccountKind } from '../models/enums/AccountKind';
import { BookingType } from '../models/enums/BookingType';
import { SalaryStatus } from '../models/enums/SalaryStatus';
import { PaymentStatus } from '../models/enums/PaymentStatus';
import { RentalStatus } from '../models/enums/RentalStatus';
import { Booking, BookingViewModel, Equipment } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';

// Helper functions for array operations
//
export function onlyUnique<T>(value: T, index: number, self: T[]): boolean {
    return self.indexOf(value) == index;
}

export function onlyUniqueByMapperFn<T>(mapperFn: (entity: T) => unknown) {
    return (value: T, index: number, self: T[]): boolean => self.map(mapperFn).indexOf(mapperFn(value)) == index;
}

export function onlyUniqueById<T extends BaseEntity>(value: T, index: number, self: T[]): boolean {
    return self.map((x) => x.id).indexOf(value.id) == index;
}

export function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export function updateItemsInArrayById<T extends HasId>(list: T[], ...updatedItems: T[]): T[] {
    return list.map((item) => updatedItems.find((x) => x.id === item.id) ?? item);
}

// Date formatter
//
const datetimeFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export const formatDatetime = (date: Date): string => date.toLocaleString('sv-SE', datetimeFormatOptions);

const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
};

export const formatDate = (date: Date): string => date.toLocaleString('sv-SE', dateFormatOptions);

export const formatNullableDate = (date: Date | null, defaultValue = '-'): string =>
    date ? date.toLocaleString('sv-SE', dateFormatOptions) : defaultValue;

// Check if value is a valid date
//
export const validDate = (date: Date | undefined): date is Date =>
    !!date && date instanceof Date && !isNaN(date.getTime());

export const convertToDateOrUndefined = (newDateString: string | undefined): Date | undefined => {
    if (!newDateString) {
        return undefined;
    }

    const date = new Date(newDateString);

    if (isNaN(date.getTime())) {
        return undefined;
    }

    return date;
};

// Get string from status code
//
export const getStatusName = (status: Status): string => {
    switch (status) {
        case Status.DRAFT:
            return 'Utkast';

        case Status.BOOKED:
            return 'Bokad';

        case Status.DONE:
            return 'Klar';

        case Status.CANCELED:
            return 'Inställd';
    }
};

export const getPricePlanName = (pricePlan: PricePlan): string => {
    switch (pricePlan) {
        case PricePlan.THS:
            return 'THS-pris';

        case PricePlan.EXTERNAL:
            return 'Standardpris';
    }
};

export const getAccountKindName = (accountKind: AccountKind): string => {
    switch (accountKind) {
        case AccountKind.EXTERNAL:
            return 'Normal';

        case AccountKind.INTERNAL:
            return 'Intern';
    }
};

export const getBookingTypeName = (bookingType: BookingType): string => {
    switch (bookingType) {
        case BookingType.GIG:
            return 'Gigg';

        case BookingType.RENTAL:
            return 'Hyra';
    }
};

export const getSalaryStatusName = (salaryStatus: SalaryStatus): string => {
    switch (salaryStatus) {
        case SalaryStatus.NOT_SENT:
            return 'Inte skickad';

        case SalaryStatus.SENT:
            return 'Skickad';
    }
};

export const getPaymentStatusName = (paymentStatus: PaymentStatus): string => {
    switch (paymentStatus) {
        case PaymentStatus.NOT_PAID:
            return 'Obetald';

        case PaymentStatus.PAID:
            return 'Betald';

        case PaymentStatus.INVOICED:
            return 'Fakturerad';

        case PaymentStatus.PAID_WITH_INVOICE:
            return 'Betald med faktura';
    }
};

export const getRentalStatusName = (rentalStatus?: RentalStatus | null): string => {
    switch (rentalStatus) {
        case RentalStatus.OUT:
            return 'Utlämnad';

        case RentalStatus.RETURNED:
            return 'Återlämnad';

        default:
            return 'Inte utlämnad';
    }
};

// Get string from member status code
//
export const getMemberStatusName = (status: MemberStatus): string => {
    switch (status) {
        case MemberStatus.CHEF:
            return 'Chef';

        case MemberStatus.AKTIV:
            return 'Aktiv';

        case MemberStatus.ASP:
            return 'Aspirant';

        case MemberStatus.RESURS:
            return 'Resurs';

        case MemberStatus.GLÖMD:
            return 'Glömden';
    }
};

// Get string from role
//
export const getRoleName = (role: Role | undefined): string => {
    switch (role) {
        case Role.ADMIN:
            return 'Administratörsbehörighet';

        case Role.USER:
            return 'Standardbehörighet';

        case Role.READONLY:
            return 'Läsbehörighet';

        default:
            return '';
    }
};

// Check if value is a valid member of an enum
//
export const isMemberOfEnum = (value: number, enumObject: Record<string, unknown>): boolean =>
    !isNaN(Number(value)) && Object.keys(enumObject).indexOf(value.toString()) >= 0;

// To date or undefined
//
export const toDateOrUndefined = (dateString: string | undefined | null): Date | undefined =>
    dateString ? new Date(dateString) : undefined;

// Parse int woth check for undefined/null
//
export const toIntOrUndefined = (value: string | undefined | null, forceAbsoluteValue = false): number | undefined => {
    if (value === undefined || value === null || value.length === 0) {
        return undefined;
    }

    const numberValue = parseInt(value.replace(/\s+/g, ''), 10);

    if (isNaN(numberValue)) {
        return undefined;
    }

    if (forceAbsoluteValue) {
        return Math.abs(numberValue);
    }

    return numberValue;
};

// Group by array helper. Creates a Record with keys generated by keyFn,
// which each contain an array of the corresponding elements form the array.
//
export function groupBy<T, K extends string | number>(array: T[], keyFn: (entity: T) => K): Record<K, T[]> {
    return array.reduce((res, entity) => {
        if (!res.hasOwnProperty(keyFn(entity))) {
            res[keyFn(entity)] = [];
        }

        res[keyFn(entity)].push(entity);

        return res;
    }, {} as Record<K, T[]>);
}

// Handle api responses in fetch calls
//
export async function getResponseContentOrError<T>(res: Response): Promise<T> {
    if (res.status !== 200) {
        throw Error(`Error ${res.status}: ${JSON.parse(await res.text()).message}`);
    }
    return res.json();
}

// Replace empty strings or strings with only whitespace with null
//
export const replaceEmptyStringWithNull = (s: string | undefined | null): string | null => {
    if (!s) {
        return null;
    }

    if (s.trim().length === 0) {
        return null;
    }

    return s;
};

export const getPricePerHour = (pricePlan: PricePlan): number | undefined => {
    if (!process.env.NEXT_PUBLIC_SALARY_NORMAL)
        throw new Error('Configuration missing salary for the Normal price plan');

    if (!process.env.NEXT_PUBLIC_SALARY_THS) throw new Error('Configuration missing salary for the THS price plan');

    const pricePerHour =
        pricePlan == PricePlan.EXTERNAL ? process.env.NEXT_PUBLIC_SALARY_NORMAL : process.env.NEXT_PUBLIC_SALARY_THS;

    return toIntOrUndefined(pricePerHour);
};

export const getBookingDates = (booking: Booking) => {
    const dates = booking.equipmentLists?.flatMap((x) => [x.usageStartDatetime, x.usageEndDatetime]).filter(validDate);

    if (!dates || (dates && dates.length === 0)) {
        return { start: undefined, end: undefined };
    }

    const start = dates.reduce((a, b) => (a < b ? a : b));
    const end = dates.reduce((a, b) => (a > b ? a : b));

    return { start, end };
};

export const toBookingViewModel = (booking: Booking): BookingViewModel => {
    const { start, end } = getBookingDates(booking);

    return { ...booking, displayStartDate: start ? formatDate(start) : '-', startDate: start, endDate: end };
};

export const showActiveBookings = (booking: BookingViewModel) => {
    return booking.status === Status.BOOKED || (booking.status === Status.DRAFT && booking.startDate);
};

// Calculate the max number of equipment used at the same time. To do this, we look
// at the start of each equipment list and check how many equipments are used. We
// know the maximum will be at one of these point since it is not possible to
// increase the number of used equipments without starting a new equipment list.
export const getMaximumNumberOfUnitUsed = (equipmentLists: EquipmentList[], equipment: Equipment) =>
    Math.max(
        0,
        ...equipmentLists
            .map((x) => x.equipmentOutDatetime ?? new Date(0)) // Calculate datetimes to check
            .map((datetime) =>
                equipmentLists
                    .filter(
                        // Find the lists which overlap the datetime
                        (list) =>
                            list.equipmentOutDatetime &&
                            list.equipmentOutDatetime <= datetime &&
                            list.equipmentInDatetime &&
                            list.equipmentInDatetime >= datetime,
                    )
                    .reduce(
                        // Sum the equipment, first over all lists and within the lists over all entries
                        (sum, list) =>
                            sum +
                            list.equipmentListEntries
                                .filter((x) => x.equipmentId === equipment.id)
                                .reduce((sum, x) => sum + x.numberOfUnits, 0),
                        0,
                    ),
            ),
    );
