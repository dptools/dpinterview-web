module.exports = {
  apps: [
    {
      name: "dpinterview-web",
      cwd: __dirname,
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        // PG_user: "...",
        // PG_host: "...",
        // PG_database: "...",
        // PG_password: "...",
        // PG_port: "5432",
      },
    },
  ],
};
