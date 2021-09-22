import { NextApiRequest, NextApiResponse } from 'next';
import { Handler, Session } from 'next-iron-session';
import { mockAdminUser } from './mock-data';

const mockWithSessionAdminFn: Handler = (handler: Handler) => (
    req: NextApiRequest & { session: Session },
    res: NextApiResponse,
) => {
    req.session = ({
        get: () => {
            return mockAdminUser;
        },
    } as unknown) as Session;
    return handler({ req: req }, res);
};

export { mockWithSessionAdminFn };
