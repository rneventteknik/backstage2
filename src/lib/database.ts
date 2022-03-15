import Knex from 'knex';
import { Model } from 'objection';
import knexConfiguration from './knexConfiguration.js';

let databaseIsInitialized = false;

// Next.js does not support running code at startup without a custom server, so we
// initialize the database connection using this method, which should be run before
// any database operations.
export const ensureDatabaseIsInitialized: () => void = () => {
    if (databaseIsInitialized) {
        return;
    }

    const knex = Knex(knexConfiguration.development); // TODO: Choose environment intelligently
    Model.knex(knex as any); // TODO: Solve types
    databaseIsInitialized = true;
};

export const getDatabaseType: () => string = () => knexConfiguration.development.client;

export const getCaseInsensitiveComparisonKeyword: () => string = () =>
    getDatabaseType() === 'postgres' ? 'ilike' : 'like';
