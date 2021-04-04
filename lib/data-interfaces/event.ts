import { EventApiModel } from '../../interfaces/api-models';
import { knex } from '../database';
import { Model } from 'objection';

export const fetchEvents = async (): Promise<EventApiModel[]> => {
    Model.knex(knex); // TODO: Fix this bs

    return EventApiModel.query().withGraphFetched('OwnerUser');
};
