import { defineConfig, devices } from '@playwright/test';

const port = 3100;
const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    workers: isCI ? 2 : undefined,
    reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: `http://localhost:${port}`,
        // The production proxy redirects plain HTTP to HTTPS unless a TLS-terminating proxy says otherwise
        extraHTTPHeaders: { 'x-forwarded-proto': 'https' },
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/admin.json' },
            dependencies: ['setup'],
        },
    ],
    webServer: {
        // CI builds the app in an earlier step, so it only needs to start it
        command: `node tests/resetTestDatabase.ts && npx next ${isCI ? 'start' : 'dev'} -p ${port}`,
        // Waits on the port rather than a URL: the readiness probe cannot send x-forwarded-proto, so in production
        // every URL answers with a redirect to HTTPS
        port,
        reuseExistingServer: !isCI,
        timeout: 120_000,
        env: {
            SQLITE_FILENAME: './test-e2e.sqlite3',
            // Empty values take precedence over .env.local, keeping a local run off Postgres and the MQTT broker
            DATABASE_URL: '',
            NEXT_PUBLIC_MQTT_BROKER_URL: '',
            SECRET_COOKIE_PASSWORD:
                process.env.SECRET_COOKIE_PASSWORD ?? 'playwright-only-cookie-password-at-least-32-chars',
        },
    },
});
