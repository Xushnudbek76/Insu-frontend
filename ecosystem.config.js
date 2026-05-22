module.exports = {
  apps: [
    {
      name: 'insu-frontend',
      cwd: __dirname,
      script: 'yarn',
      args: 'start:public',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
