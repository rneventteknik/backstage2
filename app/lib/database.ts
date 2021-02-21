import { ColumnValue, TediousType, Request, Connection, ConnectionConfig } from 'tedious';

const config: ConnectionConfig = {
    server: 'backstage2-test.database.windows.net',
    authentication: {
        type: 'default',
        options: {
            userName: 'rn',
            password: '',
        },
    },
    options: {
        database: 'backstage2',
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
