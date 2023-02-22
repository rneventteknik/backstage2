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

            const insufficientAccess =
                (requiredRole == Role.ADMIN && user?.role != Role.ADMIN) ||
                (requiredRole == Role.USER && user?.role != Role.ADMIN && user?.role != Role.USER);

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
            const publicSettings = ['content.image.favIcon'];

            return {
                props: {
                    user: user,
                    globalSettings: user.isLoggedIn ? settings : settings.filter((s) => publicSettings.includes(s.key)),
                },
            };
        },
    );

const useUserWithDefaultAccessAndWithSettings = (requiredRole: Role = Role.READONLY) => {
    return useUser('/login', '/no-access', undefined, true, requiredRole);
};

export { useUser, useUserWithDefaultAccessAndWithSettings };
