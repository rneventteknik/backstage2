export function up(knex) {
    return knex.schema.alterTable('TimeReport', (table) => {
        table.dropColumn('accountKind');
    });
}

export function down(knex) {
    return knex.schema.alterTable('TimeReport', (table) => {
        table.integer('accountKind').defaultTo('');
    });
}
