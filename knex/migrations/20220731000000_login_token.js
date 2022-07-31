export function up(knex) {
    return knex.schema.alterTable('UserAuth', (table) => {
        table.string('loginToken');
        table.dateTime('loginTokenIp');
        table.dateTime('loginTokenExpirationDate');
    });
}

export function down(knex) {
    return knex.schema.alterTable('UserAuth', (table) => {
        table.dropColumn('loginToken');
        table.dropColumn('loginTokenIp');
        table.dropColumn('loginTokenExpirationDate');
    });
}
