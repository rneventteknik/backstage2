import knexConfiguration from './src/lib/knexConfiguration.js';

const migrations = { directory: './knex/migrations' };
const seeds = { directory: './knex/seeds' };

export default {
    development: { ...knexConfiguration.development, migrations: migrations, seeds: seeds },
    production: { ...knexConfiguration.production, migrations: migrations },
};
