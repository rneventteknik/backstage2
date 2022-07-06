export function up(knex) {
    return knex.schema
        .alterTable('TimeEstimate', (table) => {
            table.integer('sortIndex').notNullable().defaultTo(0);
        })
        .alterTable('TimeReport', (table) => {
            table.integer('sortIndex').notNullable().defaultTo(0);
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('TimeEstimate', (table) => {
            table.dropColumn('sortIndex');
        })
        .alterTable('TimeReport', (table) => {
            table.dropColumn('sortIndex');
        });
}
