module.exports = {
  apps: [
    {
      name: 'dev-Front-End-Synxa-Devops',
      script: 'build/standalone/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5050,
        HOSTNAME: 'localhost',
      },
    },
  ],
};
