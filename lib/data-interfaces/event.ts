import { EventApiModel } from '../../interfaces/api-models';
import { ensureDatabaseIsInitialized } from '../database';

export const fetchEvents = async (): Promise<EventApiModel[]> => {
    ensureDatabaseIsInitialized();

    return EventApiModel.query().withGraphFetched('ownerUser');
};
