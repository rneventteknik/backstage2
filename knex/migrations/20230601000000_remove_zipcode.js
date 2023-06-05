export function up(knex) {
    return knex.schema.alterTable('User', (table) => {
        table.dropColumn('zipCode');
    });
}

export function down(knex) {
    return knex.schema.alterTable('User', (table) => {
        table.string('zipCode');
    });
}
