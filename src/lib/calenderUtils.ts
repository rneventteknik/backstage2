import { calendar_v3 } from '@googleapis/calendar';
import { fetchUserIdByNameTag } from './db-access/user';
import { notEmpty } from './utils';
import { CalendarResult } from '../models/misc/CalendarResult';
import { fetchFirstBookingByCalendarBookingId } from './db-access/booking';

export const getNameTagsFromEventName = (name: string): string[] => {
    // Get part of string within [] brackets
    const match = name.match(/\[(.*?)\]/);
    if (match) {
        return match[1]
            .split(',')
            .map((x) => (x.includes(':') ? x.split(':')[1] : x))
            .map((x) => x.trim());
    }
    return [];
};

export const getUsersIdsFromEventName = async (name: string): Promise<number[]> => {
    const nameTags = getNameTagsFromEventName(name ?? '');
    const users = await Promise.all(nameTags.map(fetchUserIdByNameTag));

    return users.map((x) => x?.id).filter(notEmpty);
};

export const mapCalendarEvent = async (event: calendar_v3.Schema$Event): Promise<CalendarResult> => {
    return {
        id: event.id as string,
        name: event.summary ?? undefined,
        description: event.description ?? undefined,
        link: event.htmlLink ?? undefined,
        location: event.location ?? undefined,
        creator: event.creator?.displayName ?? event.creator?.email ?? undefined,
        start: event.start?.dateTime ?? event.start?.date ?? undefined,
        end: event.end?.dateTime ?? event.start?.date ?? undefined,
        existingBookingId: (await fetchFirstBookingByCalendarBookingId(event.id as string))?.id,
        initials: getNameTagsFromEventName(event.summary ?? ''),
        workingUsersIds: await getUsersIdsFromEventName(event.summary ?? ''),
    };
};
