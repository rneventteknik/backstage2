import { EquipmentPrice } from '../models/interfaces';
import { BaseEntity } from '../models/interfaces/BaseEntity';
import { MemberStatus } from '../models/enums/MemberStatus';
import { Role } from '../models/enums/Role';
import { Status } from '../models/enums/Status';
import { PricePlan } from '../models/enums/PricePlan';
import { AccountKind } from '../models/enums/AccountKind';
import { EventType } from '../models/enums/EventType';
import { SalaryStatus } from '../models/enums/SalaryStatus';

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

// Date formatter
//
const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export const formatDate = (date: Date): string => date.toLocaleString('sv-SE', dateFormatOptions);

// Check if value is a valid date
//
export const validDate = (date: Date | undefined): boolean => !!date && date instanceof Date && !isNaN(date.getTime());

// Format price
//
export const formatPrice = (price: EquipmentPrice): string => {
    if (price.pricePerHour && !price.pricePerUnit) {
        return `${price.pricePerHour}kr/h`;
    } else if (!price.pricePerHour && price.pricePerUnit) {
        return `${price.pricePerUnit}kr/st`;
    } else {
        return `${price.pricePerUnit}kr + ${price.pricePerHour}kr/h`;
    }
};

export const formatTHSPrice = (price: EquipmentPrice): string => {
    if (price.pricePerHourTHS && !price.pricePerUnitTHS) {
        return `${price.pricePerHourTHS}kr/h`;
    } else if (!price.pricePerHourTHS && price.pricePerUnitTHS) {
        return `${price.pricePerUnitTHS}kr/st`;
    } else {
        return `${price.pricePerUnitTHS}kr + ${price.pricePerHourTHS}kr/h`;
    }
};

// Get string from status code
//
export const getStatusName = (status: Status): string => {
    switch (status) {
        case Status.DRAFT:
            return 'Utkast';

        case Status.BOOKED:
            return 'Bokad';

        case Status.OUT:
            return 'Utlämnad';

        case Status.ONGOING:
            return 'Pågående';

        case Status.RETURNED:
            return 'Återlämnad';

        case Status.DONE:
            return 'Klar';

        case Status.INVOICED:
            return 'Fakturerad';

        case Status.PAID:
            return 'Betald';

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

export const getEventTypeName = (eventType: EventType): string => {
    switch (eventType) {
        case EventType.GIG:
            return 'Gigg';

        case EventType.RENTAL:
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
