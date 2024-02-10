export function up(knex) {
    return knex.schema.alterTable('Equipment', (table) => {
        table.text('searchKeywords').defaultTo('');
    });
}

export function down(knex) {
    return knex.schema.alterTable('Equipment', (table) => {
        table.dropColumn('searchKeywords');
    });
}
