import { UserApiModel } from '../../interfaces/api-models/UserApiModel';
import { knex } from '../database';
import { Model } from 'objection';

export const fetchAuthUser = async (username: string): Promise<UserApiModel> => {
    Model.knex(knex);

    return UserApiModel.query()
        .where('username', username)
        .then((users) => users[0]);
};
