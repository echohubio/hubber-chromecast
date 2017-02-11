import chromecastDiscover from 'chromecast-discover';
import log from 'electron-log';

import * as chromecast from './lib/chromecast';

let lastChromecastName;
const chromecasts = {};

const startDiscovery = (iot) => {
  log.debug('start chromecast discovery');

  chromecastDiscover.on('online', (device) => {
    const chromecastName = device.friendlyName.toLowerCase();

    log.info(`found chromecast ${chromecastName}`);

    chromecasts[chromecastName] = device;

    const state = {
      devices: Object.keys(chromecasts),
    };

    iot.saveState('chromecast', state);
  });

  chromecastDiscover.start();
};

const execute = (payload) => {
  log.debug('execute');
  log.debug(payload);
  const command = payload.command;
  const chromecastName = payload.chromecastName
    || lastChromecastName || Object.keys(chromecasts)[0];
  lastChromecastName = chromecastName;
  const device = chromecasts[chromecastName];

  if (!device) {
    log.debug('Have not discovered any chromecasts yet');
    return;
  }

  switch (command) {
    case 'restart':
      chromecast.restart(device);
      break;
    case 'play':
      chromecast.play(device);
      break;
    case 'stop':
      chromecast.stop(device);
      break;
    case 'pause':
      chromecast.pause(device);
      break;
    default:
      console.error('Unknown command');
  }
};

const setup = (options, imports, register) => {
  log.debug('setup');

  // log.debug('options:', options);
  // log.debug('imports:', imports);

  const iot = imports.iot;
  const hub = imports.hub;

  register(null, {
    chromecast: {
      execute,
    },
  });

  hub.on('ready', () => {
    startDiscovery(iot);
  });
};

export default setup;
