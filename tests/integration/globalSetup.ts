import { resetTestDatabase } from '../resetTestDatabase';

export const setup = async () => {
    const filename = process.env.SQLITE_FILENAME;
    if (!filename) {
        throw new Error('SQLITE_FILENAME must be set in vitest.config.ts');
    }
    await resetTestDatabase(filename);
};
