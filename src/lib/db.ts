import * as process from "node:process"
import {Pool, PoolConfig} from 'pg';

let config: PoolConfig | undefined

if (process.env.PG_URL) {
    // Using a 'postgres://' URI
    const connectionString = process.env.PG_URL
    console.debug("Got \"PG_URL\" %s", connectionString)
    config = {connectionString}
} else if (process.env.PG_user && process.env.PG_host && process.env.PG_database && process.env.PG_password) {
    // Old environment variables
    console.debug("Using original environment variables");
    config = {
        user: process.env.PG_user,
        host: process.env.PG_host,
        database: process.env.PG_database,
        password: process.env.PG_password,
        port: process.env.PG_port ? parseInt(process.env.PG_port, 10) : undefined,
        ssl: {
            rejectUnauthorized: false,
        }
    }
} else {
    console.debug("Using node-postgresql config logic");
}

/**
 * The connection pool object for accessing PostgreSQL. Configured automatically when imported
 * by environment variables. Either by  "PG_URL" containing a `postgresql://` style connection string,
 * the default libpq options {@link https://www.postgresql.org/docs/current/libpq-envars.html}, or the
 * `PG_*` environment variables used in previous versions.
 *
 * @example
 * ```
 * PG_URL="postgres://user:password@example/database"
 * ```
 *
 * @example
 * ```
 * PG_host="example"
 * PG_database="database"
 * PG_username="user"
 * PG_password="password"
 * ```
 *
 * @example
 * ```
 * PGHOST="example"
 * PGDATABASE="database"
 * PGUSER="user"
 * PGPASSWORD="password"
 * ```
 *
 */
export const connection: Pool = new Pool(config);

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
connection.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

connection.on('connect', () => {
    console.debug("PostgreSQL connection created");
});

/**
 * @return the postgresql connection pool object
 * @deprecated import {@link connection} directly instead
 */
export function getConnection(): Pool {
    return connection
}

export default connection;
