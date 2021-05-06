import { EventApiModel } from '../../interfaces/api-models';
import { ensureDatabaseIsInitialized } from '../database';

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
