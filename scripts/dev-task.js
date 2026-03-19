#!/usr/bin/env node
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve, dirname, relative, sep } = require('node:path');

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/dev-task.js <path-to-task>');
  process.exit(1);
}

const projectRoot = process.cwd();
const taskRoot = resolve(projectRoot, target);

if (!existsSync(taskRoot)) {
  console.error(`Path not found: ${taskRoot}`);
  process.exit(1);
}

const moduleRoot = dirname(taskRoot);
const taskRelative = relative(moduleRoot, taskRoot).split(sep).join('/');
const taskSrcRoot = resolve(taskRoot, 'src');
const viteRoot = existsSync(taskSrcRoot) ? taskSrcRoot : taskRoot;

if (!taskRelative || taskRelative.startsWith('..')) {
  console.error('Task path must be inside a module folder.');
  process.exit(1);
}

const binSuffix = process.platform === 'win32' ? '.cmd' : '';
const viteBin = resolve(projectRoot, 'node_modules', '.bin', `vite${binSuffix}`);
const vite = spawn(viteBin, [viteRoot], {
  stdio: 'inherit',
  shell: true,
});

const openHint = existsSync(taskSrcRoot) ? '/' : `/${taskRelative}/`;
console.log(`Open ${openHint} in the dev server.`);

const shutdown = () => {
  vite.kill('SIGINT');
};

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
