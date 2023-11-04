export function up(knex) {
    return knex.schema.createTable('StatusTracking', (table) => {
        table.increments('id');
        table.text('name');
        table.dateTime('created');
        table.dateTime('updated');
        table.text('key');
        table.text('value');
        table.dateTime('lastStatusUpdate');
    });
}

export function down(knex) {
    return knex.schema.dropTable('StatusTracking');
}
