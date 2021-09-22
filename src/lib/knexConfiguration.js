import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const sqliteConfiguration = {
    client: 'sqlite3',
    connection: {
        filename: './dev.sqlite3',
    },
    useNullAsDefault: true,
};

const postgresConfiguration = {
    client: 'postgres',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true',
    },
};

const postgresIsConfigured = process.env.DB_HOST || process.env.DB_USER || process.env.DB_PASS || process.env.DB_NAME;
if (process.env.NODE_ENV !== 'production') {
    console.log(`[Backstage2] Using database: ${postgresIsConfigured ? 'postgres' : 'sqlite3'}`);
}

export default {
    development: postgresIsConfigured ? postgresConfiguration : sqliteConfiguration,
    production: postgresConfiguration,
};
