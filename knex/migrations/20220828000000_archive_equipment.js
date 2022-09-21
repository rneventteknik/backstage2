export function up(knex) {
    return knex.schema.alterTable('Equipment', (table) => {
        table.bool('isArchived').notNullable().defaultTo(0);
    });
}

export function down(knex) {
    return knex.schema.alterTable('Equipment', (table) => {
        table.dropColumn('isArchived');
    });
}
