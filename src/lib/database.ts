import Knex from 'knex';
import { Model } from 'objection';
import knexConfiguration from './knexConfiguration.js';

// Next.js does not support running code at startup without a custom server, so we
// initialize the database connection using this method, which should be run before
// any database operations. Next.js disregards the state of this file on reload, so
// we have to store the DATABASE_IS_INITIALIZED value as a environment variable.
export const ensureDatabaseIsInitialized: () => void = () => {
    if (process.env.DATABASE_IS_INITIALIZED) {
        return;
    }

    const knex = Knex<Record<string, unknown>[], Record<string, unknown>[]>(knexConfiguration.development); // TODO: Choose environment intelligently
    Model.knex(knex);
    process.env.DATABASE_IS_INITIALIZED = 'yes';
};

export const getDatabaseType: () => string = () => knexConfiguration.development.client;

export const getCaseInsensitiveComparisonKeyword: () => string = () =>
    getDatabaseType() === 'postgres' ? 'ilike' : 'like';
