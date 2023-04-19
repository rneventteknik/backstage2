import { GetServerSidePropsResult, NextApiRequest } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { Role } from '../models/enums/Role';
import { withSsrSession } from './session';
import { getAndVerifyUser } from './authenticate';
import { IncomingMessage } from 'http';
import { fetchSettings } from './db-access/setting';
import { KeyValue } from '../models/interfaces/KeyValue';
import { toKeyValue } from './utils';

// This function returns the current user. Depending on if the user is logged in or not
// and the user's privileges in relation to the specified required role, a redirect will
// be performed if the relevant url is provided.
const useUser = (
    redirectUrlIfNotLoggedIn?: string,
    redirectUrlIfInsufficientAccess?: string,
    redirectUrlIfLoggedIn?: string,
    attachRequestedUrlAsParameter = false,
    requiredRole: Role = Role.READONLY,
) =>
    withSsrSession(
        async ({ req }): Promise<GetServerSidePropsResult<{ user: CurrentUserInfo; globalSettings: KeyValue[] }>> => {
            // The typing of withSsrSession are incorrect, so we need to cast it to NextApiRequest & IncomingMessage
            const user = await getAndVerifyUser(req as NextApiRequest & IncomingMessage);
            const getRedirectUrlParams = () => {
                if (!attachRequestedUrlAsParameter) {
                    return '';
                }

                if (req.url === '/') {
                    return '';
                }

                return `?redirectUrl=${req.url}`;
            };

            const insufficientAccess = !hasSufficientAccess(user.role, requiredRole);

            if (!user.isLoggedIn && redirectUrlIfNotLoggedIn) {
                return {
                    redirect: { destination: redirectUrlIfNotLoggedIn + getRedirectUrlParams(), permanent: false },
                };
            }

            if (user.isLoggedIn && redirectUrlIfLoggedIn) {
                return { redirect: { destination: redirectUrlIfLoggedIn + getRedirectUrlParams(), permanent: false } };
            }

            if (insufficientAccess && redirectUrlIfInsufficientAccess) {
                return {
                    redirect: {
                        destination: redirectUrlIfInsufficientAccess + getRedirectUrlParams(),
                        permanent: false,
                    },
                };
            }

            const settings = (await fetchSettings()).map(toKeyValue);
            const publicSettings = ['content.image.favIcon', 'content.environment.name', 'content.environment.variant'];

            // Append some metadata as settings
            //
            const metadata = [
                {
                    key: 'metadata.heroku.appId',
                    value: process.env.HEROKU_APP_ID ?? '-',
                },
                {
                    key: 'metadata.heroku.appName',
                    value: process.env.HEROKU_APP_NAME ?? '-',
                },
                {
                    key: 'metadata.heroku.releaseVersion',
                    value: process.env.HEROKU_RELEASE_VERSION ?? '-',
                },
                {
                    key: 'metadata.heroku.slugCommit',
                    value: process.env.HEROKU_SLUG_COMMIT ?? '-',
                },
                {
                    key: 'metadata.heroku.slugDescription',
                    value: process.env.HEROKU_SLUG_DESCRIPTION ?? '-',
                },
                {
                    key: 'metadata.build.currentVersion',
                    value: process.env.NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION ?? '-',
                },
                {
                    key: 'metadata.build.buildDate',
                    value: process.env.NEXT_PUBLIC_BACKSTAGE2_BUILD_DATE ?? '-',
                },
            ];

            const globalSettings = [...settings, ...metadata];

            return {
                props: {
                    user: user,
                    globalSettings: user.isLoggedIn
                        ? globalSettings
                        : globalSettings.filter((s) => publicSettings.includes(s.key)),
                },
            };
        },
    );

const useUserWithDefaultAccessAndWithSettings = (requiredRole: Role = Role.READONLY) => {
    return useUser('/login', '/no-access', undefined, true, requiredRole);
};

const hasSufficientAccess = (role: Role | null | undefined, requiredRole: Role | null) => {
    switch (requiredRole) {
        case Role.ADMIN:
            return role === Role.ADMIN;

        case Role.USER:
            return role === Role.USER || role === Role.ADMIN;

        case Role.READONLY:
            return role === Role.READONLY || role === Role.USER || role === Role.ADMIN;

        case Role.CASH_PAYMENT_MANAGER:
            return role === Role.CASH_PAYMENT_MANAGER || role === Role.USER || role === Role.ADMIN;

        case null:
            return true;
    }
};

export { useUser, useUserWithDefaultAccessAndWithSettings, hasSufficientAccess };
