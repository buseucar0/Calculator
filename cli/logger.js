'use strict';

const fs = require('fs');
const path = require('path');

const CSV_HEADER =
  'timestamp,vehicleId,lat,lng,speed,heading,velocityKmh,eebl,lightBar,siren,flasher,foglight,drl,wiper,leftSignal,rightSignal\n';

class Logger {
  /**
   * @param {string} filePath  Output file path
   * @param {'csv'|'json'} format  Output format
   */
  constructor(filePath, format) {
    this._format = format;
    this._filePath = filePath;
    this._stream = fs.createWriteStream(filePath, { flags: 'w' });

    if (format === 'csv') {
      this._stream.write(CSV_HEADER);
    }
  }

  /**
   * Log a vehicle state entry.
   */
  log(state) {
    const v2x = state.v2x || {};
    if (this._format === 'csv') {
      const row = [
        new Date().toISOString(),
        state.id,
        state.lat,
        state.lng,
        state.speed || 0,
        state.heading || 0,
        v2x.velocityKmh || 0,
        v2x.eebl ? 1 : 0,
        v2x.lightBar ? 1 : 0,
        v2x.siren ? 1 : 0,
        v2x.flasher ? 1 : 0,
        v2x.foglight ? 1 : 0,
        v2x.drl ? 1 : 0,
        v2x.wiper || 0,
        v2x.leftSignal ? 1 : 0,
        v2x.rightSignal ? 1 : 0,
      ].join(',');
      this._stream.write(row + '\n');
    } else {
      const entry = {
        timestamp: new Date().toISOString(),
        vehicleId: state.id,
        lat: state.lat,
        lng: state.lng,
        speed: state.speed || 0,
        heading: state.heading || 0,
        v2x,
      };
      this._stream.write(JSON.stringify(entry) + '\n');
    }
  }

  close() {
    return new Promise((resolve) => {
      this._stream.end(resolve);
    });
  }
}

module.exports = { Logger };
