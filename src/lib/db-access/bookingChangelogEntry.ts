import { BookingChangelogEntryObjectionModel } from '../../models/objection-models/BookingObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchBookingChangelogEntry = async (
    id: number,
): Promise<BookingChangelogEntryObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return BookingChangelogEntryObjectionModel.query().findById(id);
};

export const fetchBookingChangelogEntries = async (): Promise<BookingChangelogEntryObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return BookingChangelogEntryObjectionModel.query();
};

export const fetchBookingChangelogEntrysByBookingId = async (
    id: number,
): Promise<BookingChangelogEntryObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return BookingChangelogEntryObjectionModel.query().where('bookingId', id);
};

export const updateBookingChangelogEntry = async (
    id: number,
    bookingChangelogEntry: BookingChangelogEntryObjectionModel,
): Promise<BookingChangelogEntryObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingChangelogEntryObjectionModel.query().patchAndFetchById(
        id,
        withUpdatedDate(removeIdAndDates(bookingChangelogEntry)),
    );
};

export const insertBookingChangelogEntry = async (
    bookingChangelogEntry: Partial<BookingChangelogEntryObjectionModel>,
): Promise<BookingChangelogEntryObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingChangelogEntryObjectionModel.query().insert(withCreatedDate(removeIdAndDates(bookingChangelogEntry)));
};

export const deleteBookingChangelogEntry = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return BookingChangelogEntryObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateBookingChangelogEntryObjectionModel = (
    bookingChangelogEntry: BookingChangelogEntryObjectionModel,
): boolean => {
    if (!bookingChangelogEntry) return false;

    return true;
};
