// This file is run at build time and saves the current Backstage2 version based on the version
// number specified in the currentVersion-file, and and the date. The generated data is stored in
// environment variables which can be accessed by the client and shown to the user. Since this file
// is run by node.js at build time it is written in plain Javascript and uses CommonJS-require to
// import modules.

/* eslint-disable @typescript-eslint/no-var-requires */
const versionNumber = JSON.parse(require('fs').readFileSync('package.json').toString()).version;
const currentDate = new Date().toLocaleString('sv-SE', { year: 'numeric', month: 'numeric', day: 'numeric' });

module.exports = {
    env: {
        NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION: versionNumber,
        NEXT_PUBLIC_BACKSTAGE2_BUILD_DATE: currentDate,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_EQUIPMENT_IMAGE_BASEURL
                    ? new URL(process.env.NEXT_PUBLIC_EQUIPMENT_IMAGE_BASEURL).hostname
                    : 'localhost',
                pathname: '**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/ingest/static/:path*',
                destination: 'https://eu-assets.i.posthog.com/static/:path*',
            },
            {
                source: '/ingest/:path*',
                destination: 'https://eu.i.posthog.com/:path*',
            },
        ];
    },
    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
};
