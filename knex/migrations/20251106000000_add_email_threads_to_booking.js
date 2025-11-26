export function up(knex) {
    // Create the email_threads table
    return knex.schema.createTable('EmailThread', (table) => {
        table.increments('id');
        table.text('name');
        table.dateTime('created');
        table.dateTime('updated');
        table.string('threadId');
        table.int('bookingId');
        table.foreign('bookingId').references('id').inTable('Booking');
    });
}

export function down(knex) {
    // Remove foreign key and column from Booking
    return knex.schema.dropTable('EmailThread');
}
