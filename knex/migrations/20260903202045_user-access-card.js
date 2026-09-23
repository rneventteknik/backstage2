export function up(knex) {
    return knex.schema.createTable('UserCard', (table) => {
        table.increments('id').primary();
        table.integer('userId').unsigned().notNullable().references('id').inTable('User').onDelete('CASCADE');
        table.string('cardName').notNullable();
        table.dateTime('created').notNullable().defaultTo(knex.fn.now());
        table.string('hashedCardId').notNullable().unique();
    });
}

export function down(knex) {
    return knex.schema.dropTable('UserCard');
}
