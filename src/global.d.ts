// Extends the basic ProcessEnv to include app specific entries
namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV?: "development" | "production" | "test"; // See https://nextjs.org/docs/app/guides/environment-variables#environment-variable-load-order
        PG_URL?: string
        PG_user?: string
        PG_host?: string
        PG_database?: string
        PG_password?: string
        PG_port?: string
    }
}
