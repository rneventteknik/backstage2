import { GetServerSidePropsResult, NextApiRequest } from 'next';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { Role } from '../models/enums/Role';
import { withSsrSession } from './session';
import { getAndVerifyUser } from './authenticate';
import { IncomingMessage } from 'http';


// This function returns the current user. Depending on if the user is logged in or not
// and the user's privileges in relation to the specified required role, a redirect will
// be performed if the relevant url is provided.
const useUser = (
    redirectUrlIfNotLoggedIn?: string,
    redirectUrlIfInsufficientAccess?: string,
    redirectUrlIfLoggedIn?: string,
    requiredRole: Role = Role.READONLY,
) =>
    withSsrSession(
        async ({ req }): Promise<GetServerSidePropsResult<{user: CurrentUserInfo}>> => {
            // The typing of withSsrSession are incorrect, so we need to cast it to NextApiRequest & IncomingMessage
            const user = await getAndVerifyUser(req as NextApiRequest & IncomingMessage);

            const insufficientAccess =
                (requiredRole == Role.ADMIN && user?.role != Role.ADMIN) ||
                (requiredRole == Role.USER && user?.role != Role.ADMIN && user?.role != Role.USER);

            if (!user.isLoggedIn && redirectUrlIfNotLoggedIn) {
                return { redirect: { destination: redirectUrlIfNotLoggedIn, permanent: false } };
            }

            if (user.isLoggedIn && redirectUrlIfLoggedIn) {
                return { redirect: { destination: redirectUrlIfLoggedIn, permanent: false } };
            }

            if (insufficientAccess && redirectUrlIfInsufficientAccess) {
                return { redirect: { destination: redirectUrlIfInsufficientAccess, permanent: false } };
            }

            return {
                props: {
                    user: user,
                },
            };
        }
    );

const useUserWithDefaultAccessControl = (requiredRole: Role = Role.READONLY) => {
    return useUser('/login', '/no-access', undefined, requiredRole);
};

export { useUser, useUserWithDefaultAccessControl };
