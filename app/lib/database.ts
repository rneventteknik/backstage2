import { ColumnValue, TediousType, Request, Connection, ConnectionConfig } from 'tedious';

const config: ConnectionConfig = {
    server: "backstage2-test.database.windows.net",
    authentication: {
        type: "default",
        options: {
            userName: "rn",
            password: ""
        }
    },
    options: {
        database: "backstage2",
        encrypt: true,
        rowCollectionOnDone: true
    }
};

const executeProcedure = (procedureName: string, mapperFn: (column: ColumnValue[]) => any, parameters: { name: string, type: TediousType, value: any }[] = []) => {

    return new Promise((resolve, reject) => {
        const connection = new Connection(config);

        connection.connect((err) => {
            if (err) {
                reject(err);
            }

            const request: Request = new Request(procedureName, (err) => {
                if (err) {
                    reject(err);
                }
                connection.close();
            });

            parameters.forEach(({ name, type, value }) => request.addParameter(name, type, value));

            request.on('doneInProc', (_rowCount, _more, rows) => resolve(rows.map(mapperFn)));

            connection.callProcedure(request);

        });
    });

}

export default executeProcedure;
