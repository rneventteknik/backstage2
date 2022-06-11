import { Status } from '../models/enums/Status';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import {
    fetchBookingChangelogEntrysByBookingId,
    insertBookingChangelogEntry,
    updateBookingChangelogEntry,
} from './db-access/bookingChangelogEntry';
import { getStatusName } from './utils';

export enum BookingChangelogEntryType {
    CREATE,
    BOOKING,
    STATUS,
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
    newStatus?: Status,
) => {
    if (type === BookingChangelogEntryType.STATUS && newStatus !== undefined) {
        return addChangelogToBooking(`${user.name} ändrade status till ${getStatusName(newStatus)}.`, bookingId, 0);
    }

    return addChangelogToBooking(`${user.name} ${getBookingEditActionString(type)}.`, bookingId);
};
