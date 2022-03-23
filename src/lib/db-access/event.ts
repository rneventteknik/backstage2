import { AccountKind } from '../../models/enums/AccountKind';
import { EventType } from '../../models/enums/EventType';
import { PricePlan } from '../../models/enums/PricePlan';
import { Status } from '../../models/enums/Status';
import { EventObjectionModel } from '../../models/objection-models';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { isMemberOfEnum } from '../utils';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchEvents = async (searchString: string, count: number): Promise<EventObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return EventObjectionModel.query()
        .where('name', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orWhere('contactPersonName', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orderBy('updated', 'desc')
        .limit(count);
};

export const fetchEvents = async (): Promise<EventObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query().withGraphFetched('ownerUser');
};

export const fetchEventsForUser = async (userId: number): Promise<EventObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query().where('ownerUserId', userId);
};

export const fetchEvent = async (id: number): Promise<EventObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query()
        .where('id', id)
        .withGraphFetched('ownerUser')
        .then((events) => events[0]);
};

export const fetchFirstEventByCalendarEventId = async (calendarEventId: string): Promise<EventObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query()
        .where('calendarEventId', calendarEventId)
        .then((events) => events[0]);
};

export const updateEvent = async (id: number, event: EventObjectionModel): Promise<EventObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(event)));
};

export const insertEvent = async (event: EventObjectionModel): Promise<EventObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query().insert(withCreatedDate(removeIdAndDates(event)));
};

export const deleteEvent = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEventObjectionModel = (event: EventObjectionModel): boolean => {
    if (!event) return false;

    if (!event.name) return false;

    if (!isMemberOfEnum(event.eventType, EventType)) return false;
    if (!isMemberOfEnum(event.status, Status)) return false;
    if (!isMemberOfEnum(event.pricePlan, PricePlan)) return false;
    if (!isMemberOfEnum(event.accountKind, AccountKind)) return false;

    return true;
};
