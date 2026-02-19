#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runSimulation } = require('./simulationRunner');

// ── Argument parsing ──────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
Usage:
  node cli/cli-sim.js --scenario <file> [options]

Options:
  --scenario <file>   (required) Routesim export JSON file
  --freq <hz>         Sending frequency in Hz (default: 10)
  --repeat <n>        Number of simulation repeats (default: 1)
  --output <file>     Output log file path (default: sim-output-<timestamp>.csv)
  --format csv|json   Output format (default: csv)
  --verbose           Print detailed logs to terminal
  --help              Show this help message
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    scenario: null,
    freq: 10,
    repeat: 1,
    output: null,
    format: 'csv',
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--scenario':
        opts.scenario = args[++i];
        break;
      case '--freq':
        opts.freq = Number(args[++i]);
        break;
      case '--repeat':
        opts.repeat = Number(args[++i]);
        break;
      case '--output':
        opts.output = args[++i];
        break;
      case '--format':
        opts.format = args[++i];
        break;
      case '--verbose':
        opts.verbose = true;
        break;
      case '--help':
        printUsage();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  return opts;
}

function validateOpts(opts) {
  if (!opts.scenario) {
    console.error('Error: --scenario is required.');
    printUsage();
    process.exit(1);
  }

  if (!fs.existsSync(opts.scenario)) {
    console.error(`Error: Scenario file not found: ${opts.scenario}`);
    process.exit(1);
  }

  if (!Number.isFinite(opts.freq) || opts.freq <= 0) {
    console.error('Error: --freq must be a positive number.');
    process.exit(1);
  }

  if (!Number.isInteger(opts.repeat) || opts.repeat < 1) {
    console.error('Error: --repeat must be a positive integer.');
    process.exit(1);
  }

  if (!['csv', 'json'].includes(opts.format)) {
    console.error('Error: --format must be "csv" or "json".');
    process.exit(1);
  }

  if (!opts.output) {
    const ext = opts.format === 'json' ? 'jsonl' : 'csv';
    opts.output = `sim-output-${Date.now()}.${ext}`;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv);
  validateOpts(opts);

  let scenario;
  try {
    const raw = fs.readFileSync(opts.scenario, 'utf-8');
    scenario = JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading scenario file: ${err.message}`);
    process.exit(1);
  }

  console.log(`Routesim CLI Simulation`);
  console.log(`  Scenario : ${opts.scenario}`);
  console.log(`  Vehicles : ${(scenario.vehicles || []).length}`);
  console.log(`  Frequency: ${opts.freq} Hz`);
  console.log(`  Repeat   : ${opts.repeat}`);
  console.log(`  Output   : ${opts.output} (${opts.format})`);
  console.log(`  Verbose  : ${opts.verbose}`);
  console.log('');

  await runSimulation(scenario, opts);
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
