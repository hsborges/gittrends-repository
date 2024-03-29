const { resolve } = require('path');
const url = require('url');

const { port } = url.parse(process.env.GT_PROXY_URL || 'http://localhost:3000');

module.exports = {
  apps: [
    {
      name: 'proxy-server',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env',
      script: 'github-proxy-server',
      args: [
        '--tokens',
        resolve(
          '..',
          '..',
          process.env.GT_PROXY_TOKENS_FILE ||
            `./tokens${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}.txt`
        )
      ],
      out_file: '/dev/null',
      error_file: '/dev/null',
      max_memory_restart: '250M',
      env: {
        PORT: port
      }
    },
    {
      name: 'queue-board',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env',
      script: 'dist/extra/queue-board.js',
      out_file: '/dev/null',
      error_file: '/dev/null',
      max_memory_restart: '100M',
      env: {
        PORT: process.env.GT_QUEUE_BOARD_PORT || 8082
      }
    },
    {
      name: 'scheduler',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env',
      script: 'dist/scheduler.js',
      args: ['all', '--wait', 48],
      out_file: '/dev/null',
      max_memory_restart: '100M',
      env: {
        PORT: process.env.GT_QUEUE_BOARD_PORT || 8082
      },
      autorestart: false,
      cron_restart: process.env.GT_SCHEDULER_CRON || '0 */6 * * *'
    },
    {
      name: 'repos',
      interpreter: 'node',
      interpreter_args: '--expose-gc -r @gittrends/env',
      script: 'dist/updater.js',
      args: ['--workers', process.env.GT_UPDATER_REPOS_WORKERS || 1],
      instances: process.env.GT_UPDATER_REPOS_INSTANCES || 1,
      out_file: '/dev/null',
      watch: ['dist/'],
      max_memory_restart: '512M',
      restart_delay: 5 * 1000
    },
    {
      name: 'users',
      interpreter: 'node',
      interpreter_args: '--expose-gc -r @gittrends/env',
      script: 'dist/updater.js',
      args: ['--type', 'users', '--workers', process.env.GT_UPDATER_USERS_WORKERS || 1],
      instances: process.env.GT_UPDATER_USERS_INSTANCES || 1,
      out_file: '/dev/null',
      watch: ['dist/'],
      max_memory_restart: '512M',
      restart_delay: 5 * 1000
    }
  ]
};
