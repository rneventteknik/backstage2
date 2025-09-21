import { calendar, calendar_v3 } from '@googleapis/calendar';
import { fetchUserByNameTag } from './db-access/user';
import { CalendarResult } from '../models/misc/CalendarResult';
import { fetchFirstBookingByCalendarBookingId } from './db-access/booking';
import { GaxiosResponse } from 'googleapis-common';
import { UserObjectionModel } from '../models/objection-models';
import { getGlobalSetting } from './utils';
import { fetchSettings } from './db-access/setting';

const getNameTagsFromEventName = (name: string): string[] => {
    // Get part of string within [] brackets
    const match = name.match(/\[(.*?)\]/);
    if (match) {
        return match[1]
            .split(/[,/]/)
            .map((x) => (x.includes(':') ? x.split(':')[1] : x))
            .map((x) => x.trim());
    }
    return [];
};

const getUserByTag = async (tag: string): Promise<Partial<UserObjectionModel>> => {
    const user = await fetchUserByNameTag(tag);

    if (!user) {
        return { nameTag: tag };
    }

    return user;
};

const getUsersFromEventName = async (
    name: string,
    nameTagBlackList: string[],
): Promise<Partial<UserObjectionModel>[]> => {
    const nameTags = getNameTagsFromEventName(name ?? '');
    const users = await Promise.all(nameTags.map(getUserByTag));

    return users.filter((x) => !nameTagBlackList.includes(x.nameTag ?? ''));
};

const mapCalendarEvent = async (
    event: calendar_v3.Schema$Event,
    nameTagBlackList: string[],
): Promise<CalendarResult> => {
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
        workingUsers: await getUsersFromEventName(event.summary ?? '', nameTagBlackList),
    };
};

const mapCalendarResponse = (
    res: GaxiosResponse<calendar_v3.Schema$Events>,
    nameTagBlackList: string[],
): Promise<CalendarResult[] | null> => {
    if (!res.data.items) {
        return Promise.resolve(null);
    }

    return Promise.all(res.data.items.filter((x) => x.id).map((x) => mapCalendarEvent(x, nameTagBlackList)));
};

const getNameTagBlacklist = async () => {
    const globalSettings = await fetchSettings();
    const nameTagBlackList: string[] = JSON.parse(
        getGlobalSetting('googleCalendar.nameTagBlackList', globalSettings, '[]'),
    );
    return nameTagBlackList;
};

const calendarClient = calendar({
    version: 'v3',
    auth: process.env.CALENDAR_API_KEY,
});

export const getCalendarEvent = async (calendarEventId: string) => {
    const nameTagBlackList: string[] = await getNameTagBlacklist();

    return calendarClient.events
        .get({
            calendarId: process.env.CALENDAR_ID,
            eventId: calendarEventId,
        })
        .then((result) => mapCalendarEvent(result.data, nameTagBlackList));
};

export const getCalendarEvents = async () => {
    const nameTagBlackList: string[] = await getNameTagBlacklist();

    return calendarClient.events
        .list({
            calendarId: process.env.CALENDAR_ID,
            timeMin: new Date().toISOString(),
            maxResults: 135,
            singleEvents: true,
            orderBy: 'startTime',
        })
        .then((x) => mapCalendarResponse(x, nameTagBlackList));
};
