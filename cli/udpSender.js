'use strict';

const dgram = require('dgram');

const MSG_TYPE_BSM = 1;
const PACKET_SIZE = 72;

/**
 * Build a 72-byte V2X BSM packet from vehicle state.
 *
 * Layout (Big-Endian):
 *   0..3   uint32   messageType (1 = BSM)
 *   4..11  char[8]  vehicleId (ASCII, zero-padded)
 *  12..19  float64  latitude
 *  20..27  float64  longitude
 *  28..35  float64  speed (m/s)
 *  36..43  float64  heading (degrees)
 *  44..51  float64  velocityKmh
 *  52..59  float64  timestamp (epoch ms)
 *  60..63  uint32   flags bitfield
 *  64..67  uint32   wiper
 *  68..71  uint32   reserved
 */
function buildPacket(state) {
  const buf = Buffer.alloc(PACKET_SIZE);
  let offset = 0;

  buf.writeUInt32BE(MSG_TYPE_BSM, offset);
  offset += 4;

  const idBytes = Buffer.alloc(8);
  idBytes.write(String(state.id || '').slice(0, 8), 'ascii');
  idBytes.copy(buf, offset);
  offset += 8;

  buf.writeDoubleBE(state.lat, offset);        offset += 8;
  buf.writeDoubleBE(state.lng, offset);        offset += 8;
  buf.writeDoubleBE(state.speed || 0, offset); offset += 8;
  buf.writeDoubleBE(state.heading || 0, offset); offset += 8;
  buf.writeDoubleBE(state.velocityKmh || 0, offset); offset += 8;
  buf.writeDoubleBE(Date.now(), offset);       offset += 8;

  const v2x = state.v2x || {};
  let flags = 0;
  if (v2x.eebl)        flags |= 1 << 0;
  if (v2x.lightBar)    flags |= 1 << 1;
  if (v2x.siren)       flags |= 1 << 2;
  if (v2x.flasher)     flags |= 1 << 3;
  if (v2x.foglight)    flags |= 1 << 4;
  if (v2x.drl)         flags |= 1 << 5;
  if (v2x.leftSignal)  flags |= 1 << 6;
  if (v2x.rightSignal) flags |= 1 << 7;
  buf.writeUInt32BE(flags, offset);            offset += 4;

  buf.writeUInt32BE(v2x.wiper || 0, offset);   offset += 4;
  buf.writeUInt32BE(0, offset);                 // reserved

  return buf;
}

class UdpSender {
  constructor() {
    this._socket = dgram.createSocket('udp4');
    this._closed = false;
  }

  /**
   * Send a 72-byte BSM packet to the given host:port.
   * Returns a Promise that resolves when the packet is sent.
   */
  send(state, host, port) {
    if (this._closed) {
      return Promise.reject(new Error('Socket is closed'));
    }
    const packet = buildPacket(state);
    return new Promise((resolve, reject) => {
      this._socket.send(packet, 0, PACKET_SIZE, port, host, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  close() {
    if (!this._closed) {
      this._closed = true;
      this._socket.close();
    }
  }
}

module.exports = { UdpSender, buildPacket, PACKET_SIZE };
