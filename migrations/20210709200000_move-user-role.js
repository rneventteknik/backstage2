export function up(knex) {
    return knex.schema
        .alterTable('UserAuth', (table) => {
            table.integer('role');
        })
        .alterTable('User', (table) => {
            table.dropColumn('role');
        });
}

export function down(knex) {
    return knex.schema
        .alterTable('User', (table) => {
            table.integer('role');
        })
        .alterTable('UserAuth', (table) => {
            table.dropColumn('role');
        });
}
