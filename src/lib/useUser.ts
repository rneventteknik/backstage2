import { GetServerSidePropsResult, NextApiRequest } from 'next';
import { Session } from 'next-iron-session';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { Role } from '../models/enums/Role';
import withSession from './session';
import { getAndVerifyUser } from './authenticate';

type inputDataType = {
    req: NextApiRequest & { session: Session };
};

type OutputType = () => Promise<unknown>;

// This function returns the current user. Depending on if the user is logged in or not
// and the user's privileges in relation to the specified required role, a redirect will
// be performed if the relevant url is provided.
const useUser = (
    redirectUrlIfNotLoggedIn?: string,
    redirectUrlIfInsufficientAccess?: string,
    redirectUrlIfLoggedIn?: string,
    requiredRole: Role = Role.READONLY,
): OutputType =>
    withSession(
        async ({ req }: inputDataType): Promise<GetServerSidePropsResult<{ user: CurrentUserInfo }>> => {
            const user = await getAndVerifyUser(req);

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
        },
    );

const useUserWithDefaultAccessControl = (requiredRole: Role = Role.READONLY): OutputType => {
    return useUser('/login', '/no-access', undefined, requiredRole);
};

export { useUser, useUserWithDefaultAccessControl };
