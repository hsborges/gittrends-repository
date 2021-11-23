const { resolve } = require('path');

module.exports = {
  apps: [
    {
      name: 'proxy-server',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env-config',
      script: 'github-proxy-server',
      args: ['--tokens', resolve('..', '..', process.env.GT_PROXY_TOKENS_FILE || './tokens.txt')],
      out_file: '/dev/null',
      error_file: '/dev/null',
      env: {
        PORT: process.env.GT_PROXY_PORT || 8081
      }
    },
    {
      name: 'queue-board',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env-config',
      script: 'dist/extra/queue-board.js',
      out_file: '/dev/null',
      error_file: '/dev/null',
      env: {
        PORT: process.env.GT_QUEUE_BOARD_PORT || 8082
      }
    },
    {
      name: 'scheduler',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env-config',
      script: 'dist/scheduler.js',
      args: ['all', '--wait', 48],
      out_file: '/dev/null',
      env: {
        PORT: process.env.GT_QUEUE_BOARD_PORT || 8082
      },
      autorestart: false,
      cron_restart: process.env.GT_SCHEDULER_CRON || '0 */6 * * *'
    },
    {
      name: 'repos',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env-config',
      script: 'dist/updater.js',
      args: ['--workers', process.env.GT_UPDATER_REPOS_WORKERS || 1],
      out_file: '/dev/null',
      restart_delay: 5 * 1000
    },
    {
      name: 'users',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env-config',
      script: 'dist/updater.js',
      args: ['--type', 'users', '--workers', process.env.GT_UPDATER_USERS_WORKERS || 1],
      out_file: '/dev/null',
      restart_delay: 5 * 1000
    }
  ]
};
