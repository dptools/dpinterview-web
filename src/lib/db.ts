import * as process from "node:process";
import {Pool, PoolConfig} from 'pg';

let config: PoolConfig | undefined;

if(process.env.PG_URL){
    // Using a 'postgres://' URI
    const connectionString = process.env.PG_URL
    console.debug("Got \"PG_URL\" %s", connectionString)
    config = {connectionString}
} else if (process.env.PG_user && process.env.PG_host && process.env.PG_database && process.env.PG_password) {
    console.warn("Using non-standard environment variable config")
    config = {
        user: process.env.PG_user,
        host: process.env.PG_host,
        database: process.env.PG_database,
        password: process.env.PG_password,
        port: process.env.PG_port ? parseInt(process.env.PG_port, 10) : undefined,
        ssl: {
            rejectUnauthorized: false,
        }
    };
} else {
    console.debug("Using node-postgresql config logic");
}

export const connection: Pool = new Pool(config);

connection.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});


/**
 *  @deprecated import {@link connection} directly instead
 */
export function getConnection(): Pool {
    return connection;
}

export default connection;
