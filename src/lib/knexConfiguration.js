import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const sqliteConfiguration = {
    client: 'better-sqlite3',
    connection: {
        filename: './dev.sqlite3',
    },
    useNullAsDefault: true,
};

const postgresConfiguration = {
    client: 'postgres',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
};

const postgresIsConfigured = process.env.DATABASE_URL;
if (process.env.NODE_ENV !== 'production') {
    console.log(`[Backstage2] Using database: ${postgresIsConfigured ? 'postgres' : 'sqlite3'}`);
}

export default {
    development: postgresIsConfigured ? postgresConfiguration : sqliteConfiguration,
    production: postgresConfiguration,
};
