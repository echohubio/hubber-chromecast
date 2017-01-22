import chromecastDiscover from 'chromecast-discover';
import Debug from 'debug';

import * as chromecast from './lib/chromecast';

const debug = Debug('hubber:plugin:chromecast');

let lastChromecastName;
const chromecasts = {};

const startDiscovery = (iot) => {
  debug('start chromecast discovery');

  chromecastDiscover.on('online', (device) => {
    const chromecastName = device.friendlyName.toLowerCase();

    debug(`found chromecast ${chromecastName}`);

    chromecasts[chromecastName] = device;

    const state = {
      devices: Object.keys(chromecasts),
    };

    iot.saveState('chromecast', state);
  });

  chromecastDiscover.query();
};

const execute = (payload) => {
  debug('execute');
  debug(payload);
  const command = payload.command;
  const chromecastName = payload.chromecastName
    || lastChromecastName || Object.keys(chromecasts)[0];
  lastChromecastName = chromecastName;
  const device = chromecasts[chromecastName];

  if (!device) {
    debug('Have not discovered any chromecasts yet');
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
  Debug('setup');

  Debug('options:', options);
  Debug('imports:', imports);

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

