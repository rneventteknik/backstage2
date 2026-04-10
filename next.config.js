// This file is run at build time and saves the current Backstage2 version based on the version
// number specified in the currentVersion-file, and and the date. The generated data is stored in
// environment variables which can be accessed by the client and shown to the user.

import { readFileSync } from 'fs';

const versionNumber = JSON.parse(readFileSync('package.json').toString()).version;
const currentDate = new Date().toLocaleString('sv-SE', { year: 'numeric', month: 'numeric', day: 'numeric' });

const sassOptions = {
    quietDeps: true,
    silenceDeprecations: ['import', 'legacy-js-api', 'color-functions', 'global-builtin', 'if-function'],
};

export default {
    env: {
        NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION: versionNumber,
        NEXT_PUBLIC_BACKSTAGE2_BUILD_DATE: currentDate,
    },
    sassOptions,
    webpack(config) {
        for (const rule of config.module.rules) {
            for (const oneOfRule of rule.oneOf ?? []) {
                for (const use of Array.isArray(oneOfRule.use) ? oneOfRule.use : []) {
                    if (typeof use.loader === 'string' && use.loader.includes('sass-loader')) {
                        use.options = { ...use.options, sassOptions };
                    }
                }
            }
        }
        return config;
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
