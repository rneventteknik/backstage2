import { ColumnValue, TediousType, Request, Connection, ConnectionConfig } from 'tedious';

const config: ConnectionConfig = {
    server: process.env.DB_HOST,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASS,
        },
    },
    options: {
        database: process.env.DB_NAME,
        encrypt: true,
        rowCollectionOnDone: true,
    },
};

const executeProcedure = <T>(
    procedureName: string,
    mapperFn: (column: ColumnValue[]) => T,
    parameters: { name: string; type: TediousType; value: unknown }[] = [],
): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const connection = new Connection(config);

        connection.connect((connectionErr) => {
            if (connectionErr) {
                reject(connectionErr);
            }

            const request: Request = new Request(procedureName, (requestErr) => {
                if (requestErr) {
                    reject(requestErr);
                }
                connection.close();
            });

            parameters.forEach(({ name, type, value }) => request.addParameter(name, type, value));

            request.on('doneInProc', (_rowCount, _more, rows) => resolve(rows.map(mapperFn)));

            connection.callProcedure(request);
        });
    });
};

export default executeProcedure;
