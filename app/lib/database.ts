import Knex from 'knex';

export const knex = Knex({
    client: 'mssql',
    connection: {
        server: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    },
});
