import { RentalStatus } from '../models/enums/RentalStatus';
import { Status } from '../models/enums/Status';
import { HasId } from '../models/interfaces/BaseEntity';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import {
    fetchBookingChangelogEntrysByBookingId,
    insertBookingChangelogEntry,
    updateBookingChangelogEntry,
} from './db-access/bookingChangelogEntry';

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

// The deDuplicateTimeout is how far back (in seconds) we should look for a log entry to update instead of creating a new (duplicate one). Default is fifteen minutes (900 seconds).
const addChangelogToBooking = async (message: string, bookingId: number, deDuplicateTimeout = 900) => {
    const logEntries = await fetchBookingChangelogEntrysByBookingId(bookingId);
    const existingLogEntryToUpdate = logEntries.find(
        (entry) => entry.name === message && new Date(entry.updated).getTime() > Date.now() - deDuplicateTimeout * 1000,
    );

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
    type = BookingChangelogEntryType.BOOKING,
) => {
    return addChangelogToBooking(`${user.name} ${getBookingEditActionString(type)}.`, bookingId);
};

export const logStatusChangeToBooking = (user: CurrentUserInfo, bookingId: number, newStatus: Status) => {
    return addChangelogToBooking(`${user.name} ${getStatusActionString(newStatus)}.`, bookingId, 0);
};

export const logRentalStatusChangeToBooking = (
    user: CurrentUserInfo,
    bookingId: number,
    equipmentListName: string,
    newStatus: RentalStatus | null,
) => {
    return addChangelogToBooking(
        `${user.name} ${getRentalStatusActionString(newStatus)} ${equipmentListName}.`,
        bookingId,
        0,
    );
};

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
