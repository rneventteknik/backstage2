import { EventApiModel } from '../../interfaces/api-models';
import { ensureDatabaseIsInitialized } from '../database';

export const searchEvents = async (searchString: string, count: number): Promise<EventApiModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return EventApiModel.query()
        .where('name', 'ilike', modifiedSearchString)
        .orWhere('contactPersonName', 'ilike', modifiedSearchString)
        .orderBy('updated', 'desc')
        .limit(count);
};

export const fetchEvents = async (): Promise<EventApiModel[]> => {
    ensureDatabaseIsInitialized();

    return EventApiModel.query().withGraphFetched('ownerUser');
};

export const fetchEvent = async (id: number): Promise<EventApiModel> => {
    ensureDatabaseIsInitialized();

    return EventApiModel.query()
        .where('id', id)
        .withGraphFetched('ownerUser')
        .then((events) => events[0]);
};
