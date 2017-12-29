import chromecastDiscover from 'chromecast-discover';
import log from 'electron-log';

import * as chromecast from './lib/chromecast';

class Chromecast {
  constructor(options, imports, register) {
    log.debug('Chromecast setup');

    this.chromecasts = {};
    this.lastChromecastName = null;

    register(null, {
      chromecast: this,
    });

    this.startDiscovery();
  }

  startDiscovery() {
    log.debug('start chromecast discovery');

    chromecastDiscover.on('online', (device) => {
      const chromecastName = device.friendlyName.toLowerCase();

      log.info(`found chromecast ${chromecastName}`);

      this.chromecasts[chromecastName] = device;
    });

    chromecastDiscover.start();
  }

  async execute(payload) {
    log.debug('execute');
    log.debug(payload);

    const { command } = payload;

    const chromecastName = payload.chromecastName || this.lastChromecastName || Object.keys(this.chromecasts)[0];
    this.lastChromecastName = chromecastName;

    const device = this.chromecasts[chromecastName];

    if (!device) {
      return {
        status: 'NO_CHROMECASTS',
      };
    }

    switch (command) {
      case 'restart':
        return chromecast.restart(device);
      case 'play':
        return chromecast.play(device);
      case 'stop':
        return chromecast.stop(device);
      case 'pause':
        return chromecast.pause(device);
      case 'list':
        return {
          status: 'OK',
          deviceNames: Object.keys(this.chromecasts),
        };
      default:
        console.error('Unknown command');
        return {
          status: 'UNKNOWN_COMMAND',
        };
    }
  }
}

const setup = (options, imports, register) => new Chromecast(options, imports, register);

export default setup;
