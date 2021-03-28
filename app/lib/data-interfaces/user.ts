import { UserAuthModel } from '../../interfaces/auth-models/UserAuthModel';
import { knex } from '../database';
import { Model } from 'objection';

export const fetchAuthUser = async (username: string): Promise<UserAuthModel> => {
    Model.knex(knex);

    return UserAuthModel.query()
        .where('username', username)
        .then((users) => users[0]);
};
