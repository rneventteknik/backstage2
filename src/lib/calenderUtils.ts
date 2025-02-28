import { calendar, calendar_v3 } from '@googleapis/calendar';
import { fetchUserByNameTag } from './db-access/user';
import { notEmpty } from './utils';
import { CalendarResult } from '../models/misc/CalendarResult';
import { fetchFirstBookingByCalendarBookingId } from './db-access/booking';
import { GaxiosResponse } from 'googleapis-common';
import { UserObjectionModel } from '../models/objection-models';

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

export const getUsersFromEventName = async (name: string): Promise<UserObjectionModel[]> => {
    const nameTags = getNameTagsFromEventName(name ?? '');
    const users = await Promise.all(nameTags.map(fetchUserByNameTag));

    return users.filter(notEmpty);
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
        workingUsers: await getUsersFromEventName(event.summary ?? ''),
    };
};

const mapCalendarResponse = (res: GaxiosResponse<calendar_v3.Schema$Events>): Promise<CalendarResult[] | null> => {
    if (!res.data.items) {
        return Promise.resolve(null);
    }

    return Promise.all(res.data.items.filter((x) => x.id).map(mapCalendarEvent));
};

const calendarClient = calendar({
    version: 'v3',
    auth: process.env.CALENDAR_API_KEY,
});

export const getCalendarEvent = (calendarEventId: string) =>
    calendarClient.events
        .get({
            calendarId: process.env.CALENDAR_ID,
            eventId: calendarEventId,
        })
        .then((result) => mapCalendarEvent(result.data));

export const getCalendarEvents = () =>
    calendarClient.events
        .list({
            calendarId: process.env.CALENDAR_ID,
            timeMin: new Date().toISOString(),
            maxResults: 135,
            singleEvents: true,
            orderBy: 'startTime',
        })
        .then(mapCalendarResponse);
