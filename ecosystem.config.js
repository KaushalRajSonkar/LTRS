
// PM2 Ecosystem Configuration
// Run with: pm2 start ecosystem.config.js

module.exports = {
    apps: [
        {
            name: 'learnhub-backend',
            cwd: './backend',
            script: 'src/server.js',
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 5000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true
        },
        {
            name: 'learnhub-frontend',
            cwd: './frontend',
            script: 'npm',
            args: 'run start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 3001
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            error_file: './logs/frontend-error.log',
            out_file: './logs/frontend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true
        }
    ]
};
