import { rmSync } from 'fs';
import Knex from 'knex';

// Recreates the SQLite test database from the migrations and the mock seed. Runs both as an import (Vitest global
// setup) and as a script (`node tests/resetTestDatabase.ts`, before Playwright starts the app server).
export const resetTestDatabase = async (filename: string) => {
    rmSync(filename, { force: true });

    const knex = Knex({ client: 'better-sqlite3', connection: { filename }, useNullAsDefault: true });
    try {
        await knex.migrate.latest({ directory: './knex/migrations' });
        await knex.seed.run({ directory: './knex/seeds', specific: 'mock.js' });
    } finally {
        await knex.destroy();
    }
};

if (import.meta.main) {
    const filename = process.env.SQLITE_FILENAME;
    if (!filename) {
        throw new Error('SQLITE_FILENAME must be set');
    }
    await resetTestDatabase(filename);
}
