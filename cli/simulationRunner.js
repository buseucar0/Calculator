'use strict';

const { haversineDistance, getBearing } = require('./geoUtils');
const { UdpSender } = require('./udpSender');
const { Logger } = require('./logger');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve the path array for a vehicle.
 * If vehicle.path has fewer than 2 points, look for a match in savedPaths.
 */
function resolveVehiclePath(vehicle, savedPaths) {
  if (vehicle.path && vehicle.path.length >= 2) {
    return vehicle.path;
  }
  if (Array.isArray(savedPaths)) {
    const saved = savedPaths.find(
      (sp) => sp.vehicle_id === vehicle.id || sp.vehicleId === vehicle.id
    );
    if (saved && saved.path && saved.path.length >= 2) {
      return saved.path;
    }
  }
  return null;
}

/**
 * Run the simulation for a given scenario.
 *
 * @param {object} scenario  Parsed scenario JSON
 * @param {object} opts      CLI options
 * @param {number} opts.freq Default sending frequency (Hz)
 * @param {number} opts.repeat Number of times to repeat
 * @param {string} opts.output Output file path
 * @param {string} opts.format 'csv' or 'json'
 * @param {boolean} opts.verbose Verbose logging
 */
async function runSimulation(scenario, opts) {
  const vehicles = scenario.vehicles || [];
  if (vehicles.length === 0) {
    console.error('No vehicles found in scenario.');
    return;
  }

  const logger = new Logger(opts.output, opts.format);
  const sender = new UdpSender();

  try {
    for (let rep = 0; rep < opts.repeat; rep++) {
      if (opts.repeat > 1) {
        console.log(`\n=== Repeat ${rep + 1} / ${opts.repeat} ===`);
      }

      const vehiclePromises = vehicles.map((vehicle) =>
        runVehicle(vehicle, scenario.savedPaths, sender, logger, opts)
      );

      await Promise.all(vehiclePromises);
    }

    console.log(`\nSimulation complete. Output written to: ${opts.output}`);
  } finally {
    sender.close();
    await logger.close();
  }
}

/**
 * Simulate a single vehicle along its path.
 */
async function runVehicle(vehicle, savedPaths, sender, logger, opts) {
  const vehiclePath = resolveVehiclePath(vehicle, savedPaths);
  if (!vehiclePath) {
    console.warn(`Vehicle "${vehicle.id}": no valid path found, skipping.`);
    return;
  }

  const host = vehicle.ip || '127.0.0.1';
  const port = vehicle.port || 2021;

  if (opts.verbose) {
    console.log(
      `Vehicle "${vehicle.id}": ${vehiclePath.length} waypoints, target ${host}:${port}`
    );
  }

  for (let seg = 0; seg < vehiclePath.length - 1; seg++) {
    const from = vehiclePath[seg];
    const to = vehiclePath[seg + 1];

    const hops = to.hops || 1;
    const freq = to.freq || opts.freq;
    const interval = 1000 / freq;
    const waitTime = to.waitTime || 0;
    const v2x = to.v2x || {};
    const velocityKmh = v2x.velocityKmh || 0;
    const speedMs = velocityKmh / 3.6;

    if (opts.verbose) {
      console.log(
        `  Segment ${seg + 1}: (${from.lat},${from.lng}) -> (${to.lat},${to.lng}) | hops=${hops} freq=${freq}`
      );
    }

    for (let hop = 0; hop < hops; hop++) {
      const frac = hops > 1 ? hop / (hops - 1) : 1;
      const lat = from.lat + (to.lat - from.lat) * frac;
      const lng = from.lng + (to.lng - from.lng) * frac;
      const heading = getBearing(lat, lng, to.lat, to.lng);

      const state = {
        id: vehicle.id,
        lat,
        lng,
        speed: speedMs,
        heading,
        velocityKmh,
        v2x,
      };

      try {
        await sender.send(state, host, port);
      } catch (err) {
        if (opts.verbose) {
          console.warn(`  UDP send error: ${err.message}`);
        }
      }

      logger.log(state);

      if (opts.verbose && hop % 10 === 0) {
        console.log(
          `    hop ${hop + 1}/${hops}  lat=${lat.toFixed(6)} lng=${lng.toFixed(6)} heading=${heading.toFixed(1)}°`
        );
      }

      if (hop < hops - 1) {
        await sleep(interval);
      }
    }

    if (waitTime > 0) {
      if (opts.verbose) {
        console.log(`  Waiting ${waitTime}s at waypoint...`);
      }
      await sleep(waitTime * 1000);
    }
  }

  if (opts.verbose) {
    console.log(`Vehicle "${vehicle.id}": path complete.`);
  }
}

module.exports = { runSimulation };
