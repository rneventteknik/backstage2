import { BaseEntity, HasId, HasStringId } from '../models/interfaces/BaseEntity';
import { MemberStatus } from '../models/enums/MemberStatus';
import { Role } from '../models/enums/Role';
import { Status } from '../models/enums/Status';
import { PricePlan } from '../models/enums/PricePlan';
import { AccountKind } from '../models/enums/AccountKind';
import { BookingType } from '../models/enums/BookingType';
import { SalaryStatus } from '../models/enums/SalaryStatus';
import { PaymentStatus } from '../models/enums/PaymentStatus';
import { RentalStatus } from '../models/enums/RentalStatus';
import { BookingViewModel, Equipment, TimeReport } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';
import { Language } from '../models/enums/Language';
import { getEquipmentOutDatetime, getEquipmentInDatetime, addDays, addHours } from './datetimeUtils';
import { KeyValue } from '../models/interfaces/KeyValue';

// Helper functions for array operations
//
export const onlyUnique = <T>(value: T, index: number, self: T[]): boolean => self.indexOf(value) == index;

export const onlyUniqueByMapperFn =
    <T>(mapperFn: (entity: T) => unknown) =>
    (value: T, index: number, self: T[]): boolean =>
        self.map(mapperFn).indexOf(mapperFn(value)) == index;

export const onlyUniqueById = <T extends BaseEntity>(value: T, index: number, self: T[]): boolean =>
    self.map((x) => x.id).indexOf(value.id) == index;

export const notEmpty = <T>(value: T | null | undefined): value is T => value !== null && value !== undefined;

export const updateItemsInArrayById = <T extends HasId | HasStringId>(list: T[], ...updatedItems: T[]): T[] =>
    list.map((item) => updatedItems.find((x) => x.id === item.id) ?? item);

export const uppercaseFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

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

export const getAccountKindName = (accountKind: AccountKind | null): string => {
    switch (accountKind) {
        case AccountKind.EXTERNAL:
            return 'Normal';

        case AccountKind.INTERNAL:
            return 'Intern';

        case null:
            return '-';
    }
};

export const getAccountKindSalaryInvoiceAccount = (accountKind: AccountKind, globalSettings: KeyValue[]): string => {
    switch (accountKind) {
        case AccountKind.EXTERNAL:
            return getGlobalSetting('accounts.defaultSalaryAccount.external', globalSettings);

        case AccountKind.INTERNAL:
            return getGlobalSetting('accounts.defaultSalaryAccount.internal', globalSettings);
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
            return 'Inte skickat';

        case SalaryStatus.SENT:
            return 'Skickat';
    }
};

export const getPaymentStatusName = (paymentStatus: PaymentStatus): string => {
    switch (paymentStatus) {
        case PaymentStatus.NOT_PAID:
            return 'Obetald';

        case PaymentStatus.PAID:
            return 'Skall ej faktureras';

        case PaymentStatus.INVOICED:
            return 'Fakturerad';

        case PaymentStatus.PAID_WITH_INVOICE:
            return 'Betald med faktura';

        case PaymentStatus.READY_FOR_CASH_PAYMENT:
            return 'Redo för KårX';

        case PaymentStatus.PAID_WITH_CASH:
            return 'Betald i KårX';
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

        case Role.CASH_PAYMENT_MANAGER:
            return 'Betalningshanterarbehörighet';

        default:
            return '';
    }
};

export const getLanguageName = (language: Language): string => {
    switch (language) {
        case Language.SV:
            return 'Svenska';

        case Language.EN:
            return 'Engelska';
    }
};

// Status Colors
//
export const getStatusColor = (status: Status): string => {
    switch (status) {
        case Status.DRAFT:
            return '#75346C';

        case Status.BOOKED:
            return '#1565C0';

        case Status.DONE:
            return '#28A745';

        case Status.CANCELED:
            return '#DC3545';
    }
};

// Check if value is a valid member of an enum
//
export const isMemberOfEnum = (value: number, enumObject: Record<string, unknown>): boolean =>
    !isNaN(Number(value)) && Object.keys(enumObject).indexOf(value.toString()) >= 0;

// Parse int with check for undefined/null
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
export const groupBy = <T, K extends string | number>(array: T[], keyFn: (entity: T) => K): Record<K, T[]> =>
    array.reduce(
        (res, entity) => {
            if (!res.hasOwnProperty(keyFn(entity))) {
                res[keyFn(entity)] = [];
            }

            res[keyFn(entity)].push(entity);

            return res;
        },
        {} as Record<K, T[]>,
    );

// Handle api responses in fetch calls
//
export const getResponseContentOrError = async <T>(res: Response): Promise<T> => {
    if (res.status !== 200) {
        throw Error(`Error ${res.status}: ${JSON.parse(await res.text()).message}`);
    }
    return res.json();
};

// Sum function
export const reduceSumFn = (a: number | undefined | null, b: number | undefined | null) => (a ?? 0) + (b ?? 0);

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

// Count number of null or empty values
export const countNullorEmpty = (...values: (string | Date | number | null | boolean | undefined | unknown[])[]) =>
    values.filter((x) => (Array.isArray(x) ? x.length > 0 : !!x)).length;

// Get value or if the input is an array, the first value (useful for parsing url query params)
//
export const getValueOrFirst = <T>(data: T | T[]) => (Array.isArray(data) ? data[0] : data);

export const toKeyValue = (keyValue: KeyValue): KeyValue => {
    if (!keyValue.key || keyValue.value === undefined) {
        throw 'Invalid key or value';
    }

    return {
        key: keyValue.key,
        value: keyValue.value,
    };
};

export const getGlobalSetting = (key: string, globalSettings: KeyValue[], defaultValue?: string | null): string => {
    const setting = globalSettings?.find((x) => x.key == key);

    if (setting) {
        return setting.value;
    }

    if (defaultValue != undefined) {
        return defaultValue;
    }

    throw new Error(`${key} cannot be found in the settings database`);
};

export const getDefaultLaborHourlyRate = (pricePlan: PricePlan, globalSettings: KeyValue[]): number => {
    const LaborHourlyRateExternal = getGlobalSetting('laborHourlyRate.external', globalSettings);
    const LaborHourlyRateTHS = getGlobalSetting('laborHourlyRate.ths', globalSettings);

    const defaultLaborHourlyRate = pricePlan == PricePlan.EXTERNAL ? LaborHourlyRateExternal : LaborHourlyRateTHS;

    return toIntOrUndefined(defaultLaborHourlyRate) ?? 0;
};

export const IsBookingActive = (booking: BookingViewModel) => {
    return booking.status === Status.BOOKED || (booking.status === Status.DRAFT && booking.usageStartDatetime);
};

export const IsBookingDraftOrBooked = (booking: BookingViewModel) => {
    return booking.status === Status.BOOKED || booking.status === Status.DRAFT;
};

export const IsBookingOut = (booking: BookingViewModel) => {
    if (!booking.equipmentLists) {
        throw new Error('Missing equipmentLists property');
    }

    if (booking.bookingType !== BookingType.RENTAL) {
        return false;
    }

    return booking.equipmentLists?.some((x) => x.rentalStatus === RentalStatus.OUT);
};

export const IsBookingUpcomingRental = (booking: BookingViewModel) => {
    if (!booking.equipmentLists) {
        throw new Error('Missing equipmentLists property');
    }

    if (booking.bookingType !== BookingType.RENTAL) {
        return false;
    }

    return booking.equipmentLists?.some((x) => {
        const equipmentOutDatetime = getEquipmentOutDatetime(x);
        return (
            equipmentOutDatetime &&
            equipmentOutDatetime > addHours(new Date(), -12) &&
            equipmentOutDatetime < addDays(new Date(), 7)
        );
    });
};

export const getTotalNumberOfHoursReported = (timeReports: TimeReport[]) =>
    timeReports.reduce((hours, timeReport) => hours + timeReport.billableWorkingHours, 0);

// Calculate the max number of equipment used at the same time. To do this, we look
// at the start of each equipment list and check how many equipments are used. We
// know the maximum will be at one of these point since it is not possible to
// increase the number of used equipments without starting a new equipment list.
export const getMaximumNumberOfUnitUsed = (equipmentLists: EquipmentList[], equipment: Equipment) =>
    Math.max(
        0,
        ...equipmentLists
            .map((x) => getEquipmentOutDatetime(x) ?? new Date(0)) // Calculate datetimes to check
            .map((datetime) =>
                equipmentLists
                    .filter(
                        // Find the lists which overlap the datetime
                        (list) =>
                            getEquipmentOutDatetime(list) &&
                            (getEquipmentOutDatetime(list) ?? new Date()) <= datetime &&
                            getEquipmentInDatetime(list) &&
                            (getEquipmentInDatetime(list) ?? new Date()) >= datetime,
                    )
                    .reduce(
                        // Sum the equipment, first over all lists and within the lists over all entries
                        (sum, list) =>
                            sum +
                            list.listEntries
                                .filter((x) => x.equipmentId === equipment.id)
                                .reduce((sum, x) => sum + x.numberOfUnits, 0) +
                            list.listHeadings.reduce(
                                (sum, headingList) =>
                                    sum +
                                    headingList.listEntries
                                        .filter((x) => x.equipmentId === equipment.id)
                                        .reduce((sum, x) => sum + x.numberOfUnits, 0),
                                0,
                            ),
                        0,
                    ),
            ),
    );

export const listContainsEquipment = (list: EquipmentList, equipment: HasId) =>
    list.listEntries.some((entry) => entry.equipment?.id === equipment.id) ||
    list.listHeadings.some((heading) => heading.listEntries.some((entry) => entry.equipment?.id === equipment.id));

export const range = (start: number, end: number): number[] => {
    return [...Array(end - start).keys()].map((i) => i + start);
};

export const getPartialSearchStrings = (searchString: string) =>
    searchString
        .trim()
        .split(/\s+/)
        .map((x) => '%' + x + '%');

// Function to sort entitied by created date
export const createdSortFn = (a: BaseEntity, b: BaseEntity) => {
    if ((a.created ?? 0) < (b.created ?? 0)) {
        return 1;
    }
    if ((a.created ?? 0) > (b.created ?? 0)) {
        return -1;
    }

    // Use id for sorting as a fallback
    if (a.id < b.id) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }

    return 0;
};

const formatOperationalYear = (year: number) => `${year}-${year + 1}`;

export const getOperationalYear = (date?: Date) => {
    if (!date) {
        return 'N/A';
    }

    if (date.getMonth() < 6) {
        // Operational year turns over at 1st of July (month is 0 indexed)
        return formatOperationalYear(date.getFullYear() - 1);
    }

    return formatOperationalYear(date.getFullYear());
};

export const hasSufficientAccess = (role: Role | null | undefined, requiredRole: Role | null) => {
    switch (requiredRole) {
        case Role.ADMIN:
            return role === Role.ADMIN;

        case Role.USER:
            return role === Role.USER || role === Role.ADMIN;

        case Role.READONLY:
            return role === Role.READONLY || role === Role.USER || role === Role.ADMIN;

        case Role.CASH_PAYMENT_MANAGER:
            return role === Role.CASH_PAYMENT_MANAGER || role === Role.USER || role === Role.ADMIN;

        case null:
            return true;
    }
};
