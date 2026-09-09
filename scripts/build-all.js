#!/usr/bin/env node
/**
 * Builds every service, in order, stopping at the first failure.
 *
 * This replaces the shell one-liner
 *   set -e && for D in services/*; do ([ -d $D ] && cd $D && yarn run build); done
 * which could not run on Windows at all: yarn 1 executes scripts through
 * cmd.exe regardless of the shell that invoked it, so the POSIX `for` loop died
 * with "D was unexpected at this time" and `yarn build-all` was simply
 * unavailable to anyone developing on Windows.
 *
 * Each service's build is run with its own directory as cwd, exactly as CI and
 * deploy.sh do, so all three paths execute the identical command.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SERVICES_DIR = path.join(ROOT, 'services');

const services = fs
  .readdirSync(SERVICES_DIR)
  .filter(name => fs.statSync(path.join(SERVICES_DIR, name)).isDirectory())
  .sort();

if (services.length === 0) {
  console.error('No services found in ' + SERVICES_DIR);
  process.exit(1);
}

for (const name of services) {
  const cwd = path.join(SERVICES_DIR, name);
  const pkg = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkg)) {
    console.log('services/' + name + ' (no package.json, skipping)');
    continue;
  }
  const scripts = JSON.parse(fs.readFileSync(pkg, 'utf8')).scripts || {};
  if (!scripts.build) {
    console.log('services/' + name + ' (no build script, skipping)');
    continue;
  }

  console.log('services/' + name);
  // `shell: true` so this works with yarn's .cmd shim on Windows and the
  // plain executable elsewhere.
  const res = spawnSync('yarn', ['run', 'build'], {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
  if (res.error) {
    console.error(
      'services/' + name + ' failed to start: ' + res.error.message,
    );
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(
      'services/' + name + ' build failed (exit ' + res.status + ')',
    );
    process.exit(res.status === null ? 1 : res.status);
  }
}

console.log('All ' + services.length + ' services built.');
