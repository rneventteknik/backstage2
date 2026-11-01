import { describe, expect, it } from 'vitest';
import {
    deleteBooking,
    fetchBooking,
    insertBooking,
    searchBookings,
    updateBooking,
} from '../../src/lib/db-access/booking';
import { fetchUserAuth } from '../../src/lib/db-access';
import { BookingObjectionModel } from '../../src/models/objection-models';

describe('booking data access', () => {
    it('creates, finds, updates and deletes a booking', async () => {
        const owner = await fetchUserAuth('albert');

        const inserted = await insertBooking({
            name: 'Integrationstestbokning',
            ownerUserId: owner.userId,
            bookingType: 1,
            status: 0,
            salaryStatus: 0,
            paymentStatus: 0,
            pricePlan: 1,
            accountKind: 1,
            language: 'sv',
        } as BookingObjectionModel);

        expect((await fetchBooking(inserted.id)).name).toBe('Integrationstestbokning');

        const searchResults = await searchBookings('Integrationstest', 10);
        expect(searchResults.map((booking) => booking.id)).toContain(inserted.id);

        const updated = await updateBooking(inserted.id, { location: 'Nya Matsalen' });
        expect(updated.location).toBe('Nya Matsalen');

        expect(await deleteBooking(inserted.id)).toBe(true);
        expect(await fetchBooking(inserted.id)).toBeUndefined();
    });
});
