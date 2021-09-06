import { rest } from 'msw';
import { mockAdminUser, mockEvents, mockUsers } from './mock-data';

const handlers = [
    rest.post('http://localhost/api/users/login', (req, res, ctx) => {
        switch ((req.body as Record<string, string>)['password']) {
            case 'correct-password':
                return res(ctx.json(mockAdminUser));
            default:
                return res(ctx.json({ statusCode: 403, message: 'Invalid login' }), ctx.status(403));
        }
    }),
    rest.get('http://localhost/api/users/logout', (_req, res, ctx) => {
        return res(ctx.json({ isLoggedIn: false }));
    }),
    rest.get('http://localhost/api/search', (req, res, ctx) => {
        switch (req.url.searchParams.get('s')) {
            case 'has-matches':
                return res(
                    ctx.json({
                        events: mockEvents,
                        equipment: [],
                        users: mockUsers,
                    }),
                );
            default:
                return res(
                    ctx.json({
                        events: [],
                        equipment: [],
                        users: [],
                    }),
                );
        }
    }),
];

export { handlers };
