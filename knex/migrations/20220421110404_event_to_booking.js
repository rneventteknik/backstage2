export function up(knex) {
    return knex.schema

        .alterTable('CoOwner', (table) => {
            table.renameColumn('eventId', 'bookingId');
        })
        .alterTable('EquipmentList', (table) => {
            table.renameColumn('eventId', 'bookingId');
        })
        .alterTable('Event', (table) => {
            table.renameColumn('eventType', 'bookingType');
            table.renameColumn('calendarEventId', 'calendarBookingId');
        })
        .alterTable('EventChangelogEntry', (table) => {
            table.renameColumn('eventId', 'bookingId');
        })
        .alterTable('EventInvoiceGroup', (table) => {
            table.renameColumn('eventId', 'bookingId');
        })
        .alterTable('EventSalaryGroup', (table) => {
            table.renameColumn('eventId', 'bookingId');
        })
        .alterTable('TimeEstimate', (table) => {
            table.renameColumn('eventId', 'bookingId');
        })
        .alterTable('TimeReport', (table) => {
            table.renameColumn('eventId', 'bookingId');
        })
        .renameTable('Event', 'Booking')
        .renameTable('EventChangelogEntry', 'BookingChangelogEntry')
        .renameTable('EventInvoiceGroup', 'BookingInvoiceGroup')
        .renameTable('EventSalaryGroup', 'BookingSalaryGroup');
}

export function down(knex) {
    return knex.schema
        .renameTable('Booking', 'Event')
        .renameTable('BookingChangelogEntry', 'EventChangelogEntry')
        .renameTable('BookingInvoiceGroup', 'EventInvoiceGroup')
        .renameTable('BookingSalaryGroup', 'EventSalaryGroup')
        .alterTable('CoOwner', (table) => {
            table.renameColumn('bookingId', 'eventId');
        })
        .alterTable('EquipmentList', (table) => {
            table.renameColumn('bookingId', 'eventId');
        })
        .alterTable('Event', (table) => {
            table.renameColumn('bookingType', 'eventType');
            table.renameColumn('calendarBookingId', 'calendarEventId');
        })
        .alterTable('EventChangelogEntry', (table) => {
            table.renameColumn('bookingId', 'eventId');
        })
        .alterTable('EventInvoiceGroup', (table) => {
            table.renameColumn('bookingId', 'eventId');
        })
        .alterTable('EventSalaryGroup', (table) => {
            table.renameColumn('bookingId', 'eventId');
        })
        .alterTable('TimeEstimate', (table) => {
            table.renameColumn('bookingId', 'eventId');
        })
        .alterTable('TimeReport', (table) => {
            table.renameColumn('bookingId', 'eventId');
        });
}
