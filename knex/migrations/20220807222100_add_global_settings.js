export function up(knex) {
    return knex.schema.createTable('Setting', (table) => {
        table.increments('id');
        table.text('name').unique();
        table.text('value');
        table.dateTime('created');
        table.dateTime('updated');
    });
}

export function down(knex) {
    return knex.schema.dropTable('Setting');
}
