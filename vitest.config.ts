import { defineConfig } from 'vitest/config';

// Set on the main process rather than through `test.env`, which global setup does not see. Test workers inherit it.
process.env.SQLITE_FILENAME = './test-integration.sqlite3';

export default defineConfig({
    test: {
        include: ['tests/integration/**/*.test.ts'],
        globalSetup: ['tests/integration/globalSetup.ts'],
        // All test files share one SQLite database, so they must not run concurrently
        fileParallelism: false,
    },
});
