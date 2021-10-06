import { EventObjectionModel } from '../../models/objection-models';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';

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

export const fetchEvent = async (id: number): Promise<EventObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.query()
        .where('id', id)
        .withGraphFetched('ownerUser')
        .then((events) => events[0]);
};
