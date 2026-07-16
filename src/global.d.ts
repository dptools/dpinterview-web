// Extends the basic ProcessEnv to include app specific entries
namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV?: "development" | "test" | "production";
        PG_URL?: string
        PG_user?: string
        PG_host?: string
        PG_database?: string
        PG_password?: string
        PG_port?: string
    }
}
