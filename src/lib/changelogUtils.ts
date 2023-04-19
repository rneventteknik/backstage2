import { PaymentStatus } from '../models/enums/PaymentStatus';
import { RentalStatus } from '../models/enums/RentalStatus';
import { Status } from '../models/enums/Status';
import { HasId } from '../models/interfaces/BaseEntity';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { EquipmentChangelogEntryObjectionModel } from '../models/objection-models';
import { BookingChangelogEntryObjectionModel } from '../models/objection-models/BookingObjectionModel';
import {
    fetchBookingChangelogEntrysByBookingId,
    insertBookingChangelogEntry,
    updateBookingChangelogEntry,
} from './db-access/bookingChangelogEntry';
import {
    fetchEquipmentChangelogEntrysByEquipmentId,
    updateEquipmentChangelogEntry,
    insertEquipmentChangelogEntry,
} from './db-access/equipmentChangelogEntry';
import { sendSlackMessageForBooking } from './slack';

// Bookings
//

export enum BookingChangelogEntryType {
    CREATE,
    BOOKING,
    EQUIPMENTLIST,
    TIMEESTIMATE,
    TIMEREPORT,
}

const getBookingEditActionString = (type: BookingChangelogEntryType) => {
    switch (type) {
        case BookingChangelogEntryType.CREATE:
            return 'skapade bokningen';
        case BookingChangelogEntryType.BOOKING:
            return 'redigerade bokningen';
        case BookingChangelogEntryType.EQUIPMENTLIST:
            return 'redigerade bokningens utrustningslistor';
        case BookingChangelogEntryType.TIMEESTIMATE:
            return 'redigerade bokningens tidsestimat';
        case BookingChangelogEntryType.TIMEREPORT:
            return 'redigerade bokningens tidsrapporter';
    }
};

const getStatusActionString = (type: Status) => {
    switch (type) {
        case Status.DRAFT:
            return 'gjorde bokningen till ett utkast';
        case Status.BOOKED:
            return 'markarade bokningen som bokad';
        case Status.DONE:
            return 'klarmarkerade bokningen';
        case Status.CANCELED:
            return 'ställde in bokningen';
    }
};

const getRentalStatusActionString = (type: RentalStatus | null) => {
    switch (type) {
        case RentalStatus.OUT:
            return 'lämnade ut';
        case RentalStatus.RETURNED:
            return 'tog emot';
        case null:
            return 'återställde utlämningsstatus på';
    }
};

const getPaymentStatusActionString = (type: PaymentStatus | null) => {
    switch (type) {
        case PaymentStatus.NOT_PAID:
            return 'markerade bokningen som obetald';

        case PaymentStatus.PAID:
            return 'markerade bokningen som betald';

        case PaymentStatus.INVOICED:
            return 'skickade faktura för bokningen';

        case PaymentStatus.PAID_WITH_INVOICE:
            return 'markerade bokningen som betald med faktura';

        case PaymentStatus.READY_FOR_CASH_PAYMENT:
            return 'skickade bokningen för betalning i KårX';

        case PaymentStatus.PAID_WITH_CASH:
            return 'markerade bokningen som betald i KårX';
    }
};

// The deDuplicateTimeout is how far back (in seconds) we should look for a log entry to update instead of creating a new (duplicate one). Default is fifteen minutes (900 seconds).
const addChangelogToBooking = async (message: string, bookingId: number, deDuplicateTimeout = 900) => {
    const logEntries = await fetchBookingChangelogEntrysByBookingId(bookingId);
    const existingLogEntryToUpdate = getExistingLogEntryToUpdate(logEntries, message, deDuplicateTimeout);

    if (existingLogEntryToUpdate) {
        updateBookingChangelogEntry(existingLogEntryToUpdate.id, existingLogEntryToUpdate);
        return message;
    }

    insertBookingChangelogEntry({
        name: message,
        bookingId: bookingId,
    });

    return message;
};

export const logChangeToBooking = (
    user: CurrentUserInfo,
    bookingId: number,
    bookingName: string,
    type = BookingChangelogEntryType.BOOKING,
) => {
    const message = `${user.name} ${getBookingEditActionString(type)}.`;

    if (type === BookingChangelogEntryType.CREATE) {
        sendSlackMessageForBooking(message, bookingId, bookingName);
    }

    return addChangelogToBooking(message, bookingId);
};

export const logStatusChangeToBooking = (
    user: CurrentUserInfo,
    bookingId: number,
    bookingName: string,
    newStatus: Status,
) => {
    const message = `${user.name} ${getStatusActionString(newStatus)}.`;

    sendSlackMessageForBooking(message, bookingId, bookingName);
    return addChangelogToBooking(message, bookingId, 0);
};

export const logRentalStatusChangeToBooking = (
    user: CurrentUserInfo,
    bookingId: number,
    bookingName: string,
    equipmentListName: string,
    newStatus: RentalStatus | null,
) => {
    const message = `${user.name} ${getRentalStatusActionString(newStatus)} ${equipmentListName}.`;

    sendSlackMessageForBooking(message, bookingId, bookingName);
    return addChangelogToBooking(message, bookingId, 0);
};

export const logBookingDeletion = (user: CurrentUserInfo, bookingId: number, bookingName: string) => {
    const message = `${user.name} tog bort bokningen.`;

    sendSlackMessageForBooking(message, bookingId, bookingName);
};

export const logPaymentStatusChangeToBooking = (
    user: CurrentUserInfo,
    bookingId: number,
    bookingName: string,
    newStatus: PaymentStatus | null,
) => {
    const message = `${user.name} ${getPaymentStatusActionString(newStatus)}.`;

    sendSlackMessageForBooking(message, bookingId, bookingName);
    return addChangelogToBooking(message, bookingId, 0);
};

// Equipment
//

export enum EquipmentChangelogEntryType {
    CREATE,
    EQUIPMENT,
    PRICES,
}

const getEquipmentEditActionString = (type: EquipmentChangelogEntryType) => {
    switch (type) {
        case EquipmentChangelogEntryType.CREATE:
            return 'skapade utrustningen';
        case EquipmentChangelogEntryType.EQUIPMENT:
            return 'redigerade utrustningen';
        case EquipmentChangelogEntryType.PRICES:
            return 'redigerade utrustningens priser';
    }
};

const getEquipmentArchivalStatusActionString = (newArchivalStatus: boolean) => {
    switch (newArchivalStatus) {
        case true:
            return 'arkiverade utrustningen';
        case false:
            return 'avarkiverade utrustningen';
    }
};

// The deDuplicateTimeout is how far back (in seconds) we should look for a log entry to update instead of creating a new (duplicate one). Default is fifteen minutes (900 seconds).
const addChangelogToEquipment = async (message: string, equipmentId: number, deDuplicateTimeout = 900) => {
    const logEntries = await fetchEquipmentChangelogEntrysByEquipmentId(equipmentId);
    const existingLogEntryToUpdate = getExistingLogEntryToUpdate(logEntries, message, deDuplicateTimeout);

    if (existingLogEntryToUpdate) {
        updateEquipmentChangelogEntry(existingLogEntryToUpdate.id, existingLogEntryToUpdate);
        return message;
    }

    insertEquipmentChangelogEntry({
        name: message,
        equipmentId: equipmentId,
    });

    return message;
};

export const logChangeToEquipment = (
    user: CurrentUserInfo,
    equipmentId: number,
    type = EquipmentChangelogEntryType.EQUIPMENT,
) => {
    return addChangelogToEquipment(`${user.name} ${getEquipmentEditActionString(type)}.`, equipmentId);
};

export const logArchivalStatusChangeToEquipment = (
    user: CurrentUserInfo,
    equipmentId: number,
    newArchivalStatus: boolean,
) => {
    return addChangelogToEquipment(
        `${user.name} ${getEquipmentArchivalStatusActionString(newArchivalStatus)}.`,
        equipmentId,
        0,
    );
};

// Shared helpers
//

const getExistingLogEntryToUpdate = <
    T extends BookingChangelogEntryObjectionModel | EquipmentChangelogEntryObjectionModel,
>(
    logEntries: T[],
    message: string,
    deDuplicateTimeout: number,
) =>
    logEntries.find(
        (entry) => entry.name === message && new Date(entry.updated).getTime() > Date.now() - deDuplicateTimeout * 1000,
    );

// Note: this function only does a shallow compare of non-object and non-array properties.
export const hasChanges = <T extends HasId>(entity: T, updates: Partial<T>, ignoreProperties: string[] = []) => {
    // Loop through all properties of the existing object and look for updates
    for (const key in entity) {
        // Ignore keys that does not exist on updates object
        if (updates[key] === undefined) {
            continue;
        }

        // Ignore child objects and arrays
        if (typeof entity[key] === 'object' && entity[key] !== null) {
            continue;
        }

        // Ignore all properties in the ignoreProperties-list
        if (ignoreProperties.includes(key)) {
            continue;
        }

        if (entity[key] != updates[key]) {
            return true;
        }
    }

    return false;
};

export const hasListChanges = <T extends HasId>(
    list?: T[] | null,
    updatedList?: Partial<T>[] | null,
    ignoreProperties: string[] = [],
) => {
    // List is deleted or created
    if (!list || !updatedList) {
        return true;
    }

    // Check for added items
    if (updatedList.some((entity) => !list.some((l) => l.id === entity.id))) {
        return true;
    }

    for (const entity of list) {
        const updates = updatedList.find((x) => x.id === entity.id);

        // Check for deleted items
        if (!updates) {
            return true;
        }

        // Check for updated items
        if (hasChanges(entity, updates, ignoreProperties)) {
            return true;
        }
    }

    return false;
};
