module.exports = {
    apps: [
        {
            script: 'dist/main.js',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            // max_memory_restart: '1G',
            env_test: {
                NODE_ENV: 'test',
                name: 'nest-app-test',
                instances: 1,
                PORT: 2001
            },
            env_prod: {
                NODE_ENV: 'prod',
                name: 'nest-app-prod',
                PORT: 2002,
                instances: 1,
            }
        },
    ],
};