import Knex from 'knex';
import { Model } from 'objection';

const knexConfiguration = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true',
    },
};

let databaseIsInitialized = false;

// Next.js does not support running code at startup without a custom server, so we
// initialize the database connection using this method, which should be run before
// any database operations.
export const ensureDatabaseIsInitialized: () => void = () => {
    if (databaseIsInitialized) {
        return;
    }

    const knex = Knex(knexConfiguration);
    Model.knex(knex);
    databaseIsInitialized = true;
};
