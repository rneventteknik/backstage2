export function up(knex) {
    
    return knex.schema.createTable('BookingCalendarEvent', (table) => {
        table.increments('id');
        table.dateTime('created');
        table.dateTime('updated');
        table.int('bookingId').notNullable();
        table.foreign('bookingId').references('id').inTable('Booking');
        table.string('calendarEventId').notNullable();
    }).then(async () => {
        const rows = await knex('Booking').select('id', 'updated', 'calendarBookingId').whereRaw('calendarBookingId IS NOT NULL');
        if (rows.length > 0) {
            await knex('BookingCalendarEvent').insert(
                rows.map(row => ({
                    created: row.updated,
                    updated: row.updated,
                    bookingId: row.id,
                    calendarEventId: row.calendarBookingId,
                }))
            );
        }
    });
}

export function down(knex) {
    return knex.schema.dropTable('BookingCalendarEvent');
}
