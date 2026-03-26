#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const coreDir = path.join(__dirname, 'packages', 'core');
process.chdir(coreDir);

const results = [];

// Test 1: Build
console.log('='.repeat(60));
console.log('EXECUTING: Build Command');
console.log('='.repeat(60));
try {
  const buildCmd = 'pnpm run build';
  console.log(`Command: ${buildCmd}`);
  console.log(`Working Directory: ${process.cwd()}`);
  const output = execSync(buildCmd, {
    cwd: coreDir,
    stdio: 'inherit',
    shell: true,
    encoding: 'utf-8'
  });
  console.log('\n✓ Build succeeded');
  results.push({
    command: buildCmd,
    executed: true,
    exitCode: 0,
    status: 'SUCCESS'
  });
} catch (e) {
  console.error('\n✗ Build failed');
  console.error(`Exit Code: ${e.status}`);
  console.error(e.message);
  results.push({
    command: 'pnpm run build',
    executed: true,
    exitCode: e.status || 1,
    status: 'FAILURE',
    error: e.message
  });
}

console.log('\n' + '='.repeat(60));
console.log('EXECUTING: Test Command');
console.log('='.repeat(60));

// Test 2: Tests
try {
  const testCmd = 'pnpm run test';
  console.log(`Command: ${testCmd}`);
  console.log(`Working Directory: ${process.cwd()}`);
  const output = execSync(testCmd, {
    cwd: coreDir,
    stdio: 'inherit',
    shell: true,
    encoding: 'utf-8'
  });
  console.log('\n✓ Tests passed');
  results.push({
    command: testCmd,
    executed: true,
    exitCode: 0,
    status: 'SUCCESS'
  });
} catch (e) {
  console.error('\n✗ Tests failed');
  console.error(`Exit Code: ${e.status}`);
  console.error(e.message);
  results.push({
    command: 'pnpm run test',
    executed: true,
    exitCode: e.status || 1,
    status: 'FAILURE',
    error: e.message
  });
}

console.log('\n' + '='.repeat(60));
console.log('EXECUTION SUMMARY');
console.log('='.repeat(60));
results.forEach(r => {
  console.log(`\nCommand: ${r.command}`);
  console.log(`Executed: ${r.executed}`);
  console.log(`Exit Code: ${r.exitCode}`);
  console.log(`Status: ${r.status}`);
  if (r.error) console.log(`Error: ${r.error}`);
});
