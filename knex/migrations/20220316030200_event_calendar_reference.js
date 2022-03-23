export function up(knex) {
    return knex.schema.alterTable('Event', (table) => {
        table.text('calendarEventId');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Event', (table) => {
        table.dropColumn('calendarEventId');
    });
}
