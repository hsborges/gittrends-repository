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
        '--request-interval',
        100,
        '--request-timeout',
        60000,
        '--tokens',
        resolve(
          '..',
          '..',
          process.env.GT_PROXY_TOKENS_FILE ||
            `./tokens${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}.txt`
        )
      ],
      out_file: '/dev/null',
      max_memory_restart: '150M',
      env: {
        PORT: port
      }
    },
    {
      name: 'queue-board',
      interpreter: 'node',
      interpreter_args: '-r @gittrends/env',
      script: 'dist/extra/queue-board.js',
      max_memory_restart: '100M',
      env: {
        PORT: process.env.GT_QUEUE_BOARD_PORT || 8082
      }
    },
    // {
    //   name: 'scheduler',
    //   interpreter: 'node',
    //   interpreter_args: '-r @gittrends/env',
    //   script: 'dist/scheduler.js',
    //   args: ['all', '--wait', 48],
    //   max_memory_restart: '100M',
    //   env: {
    //     PORT: process.env.GT_QUEUE_BOARD_PORT || 8082
    //   },
    //   autorestart: false,
    //   cron_restart: process.env.GT_SCHEDULER_CRON || '0 */6 * * *'
    // },
    {
      name: 'persister',
      interpreter: 'node',
      interpreter_args: '--expose-gc -r @gittrends/env',
      script: 'dist/updater-persist.js',
      args: ['--workers', 2],
      watch: ['dist/'],
      max_memory_restart: '256M',
      restart_delay: 2 * 1000
    },
    {
      name: 'repos',
      interpreter: 'node',
      interpreter_args: '--expose-gc -r @gittrends/env',
      script: 'dist/updater-collect.js',
      args: ['--workers', process.env.GT_UPDATER_REPOS_WORKERS || 1],
      instances: process.env.GT_UPDATER_REPOS_INSTANCES || 1,
      watch: ['dist/'],
      max_memory_restart: '512M',
      restart_delay: 2 * 1000
    },
    {
      name: 'users',
      interpreter: 'node',
      interpreter_args: '--expose-gc -r @gittrends/env',
      script: 'dist/updater-collect.js',
      args: ['--type', 'users', '--workers', process.env.GT_UPDATER_USERS_WORKERS || 1],
      instances: process.env.GT_UPDATER_USERS_INSTANCES || 1,
      watch: ['dist/'],
      max_memory_restart: '512M',
      restart_delay: 5 * 1000
    }
  ]
};
