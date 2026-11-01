import { describe, expect, it } from 'vitest';
import { authenticate } from '../../src/lib/authenticate';

describe('authenticate', () => {
    it('returns the user for a correct username and password', async () => {
        const user = await authenticate('albert', 'dmx');

        expect(user?.username).toBe('albert');
        expect(user?.user?.id).toBeDefined();
    });

    it('treats usernames as case-insensitive', async () => {
        const user = await authenticate('Albert', 'dmx');

        expect(user?.username).toBe('albert');
    });

    it('rejects a wrong password', async () => {
        expect(await authenticate('albert', 'wrong')).toBeNull();
    });

    it('rejects an unknown user', async () => {
        expect(await authenticate('nobody', 'dmx')).toBeNull();
    });
});
