import chromecastDiscover from 'chromecast-discover';
// import phetch from 'phetch';
import Debug from 'debug';

const debug = Debug('chromecast');


// get this from somerhww
// let lastChromecastName;
const chromecasts = {};

const startDiscovery = (thing) => {
  debug('setup chromecast');

  chromecastDiscover.on('online', (chromecast) => {
    const chromecastName = chromecast.friendlyName.toLowerCase();

    debug('registering new chromecast');

    chromecasts[chromecastName] = chromecast;

    const chromecastState = {
      state: {
        reported: {
          chromecasts,
        },
      },
    };

    const clientTokenUpdate = thing.shadows.update(thing.name, chromecastState);

    if (clientTokenUpdate === null) {
      console.error('update shadow failed, operation still in progress');
    }
  });
};


// const restartChromecast = (chromecastName) => {
//   const chromecast = chromecasts[chromecastName];
//   const uri = `http://${chromecast.addresses[0]}:8008/setup/reboot`;
//   const body = {
//     params: 'now',
//   };

//   debug(`restarting ${chromecastName}`);

//   phetch.post(uri)
//     .set('Content-Type', 'application/json')
//     .set('Accept', 'application/json')
//     .json(body)
//     .catch((err) => {
//       console.error(`Failed to restart chromecast: ${err}`);
//     });
// };

// const Client = require('castv2-client').Client;
// const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

// const client = new Client();

// client.on('error', (err) => {
//   console.error('Error: %s', err.message);
//   client.close();
// });

// client.on('message', ([> data, broadcast<]) => {
//   // console.log('message', data, broadcast);
// });

// const mediaCommandChromecast = (chromecastName, command) => {
//   const chromecast = chromecasts[chromecastName];

//   debug(`running command ${command} on ${chromecastName}`);

//   client.connect(chromecast.addresses[0], () => {
//     debug(`connected to chromecast ${chromecast.friendlyName}`);

//     client.getSessions((err, stat) => {
//       debug('git session');

//       if (err) {
//         console.error(err);
//         return;
//       }

//       const session = stat[0];

//       client.join(session, DefaultMediaReceiver, (clientError, application) => {
//         debug('joined session');
//         if (clientError) {
//           console.error(clientError);
//           return;
//         }

//         application.getStatus((applicationError, applicationStatus) => {
//           if (applicationError) {
//             console.error(applicationError);
//             return;
//           }
//           debug('application status', applicationStatus);

//           application[command]((commandError, commandStatus) => {
//             if (commandError) {
//               console.error(commandError);
//               return;
//             }
//             debug('command status', commandStatus);
//           });
//         });
//       });
//     });
//   });
// };

// const pauseChromecast = (chromecast) => {
//   mediaCommandChromecast(chromecast, 'pause');
// };

// const stopChromecast = (chromecast) => {
//   mediaCommandChromecast(chromecast, 'stop');
// };

// const playChromecast = (chromecast) => {
//   mediaCommandChromecast(chromecast, 'play');
// };

// thingShadows.on('message', (topic, payloadJSON) => {
//   debug('iot:message', topic, payloadJSON.toString());

//   const payload = JSON.parse(payloadJSON);

//   const chromecastName = payload.chromecastName ||
//     lastChromecastName || Object.keys(chromecasts)[0];

//   lastChromecastName = chromecastName;

//   if (payload.command === 'restart') {
//     restartChromecast(chromecastName);
//   } else if (payload.command === 'play') {
//     playChromecast(chromecastName);
//   } else if (payload.command === 'stop') {
//     stopChromecast(chromecastName);
//   } else if (payload.command === 'pause') {
//     pauseChromecast(chromecastName);
//   } else {
//     console.error('Unknown command');
//   }
// });

const setup = (options, imports, register) => {
  Debug('setup');

  Debug('options:', options);
  Debug('imports:', imports);

  const thing = imports.thing;

  startDiscovery(thing);

  register(null, {});
};

export default setup;

/*
function stopChromecast(chromecast) {
  client.connect(chromecast.addresses[0], function() {
    debug('connected to chromecast ' + chromecast.friendlyName);

    client.getSessions(function(err, stat) {
      if (err) {
        console.log(err);
        return;
      }

      var session = stat[0];

      client.receiver.stop(session.sessionId, function(moo, cow) {
        debug('stopped: ', session);
        console.log(cow);

        client.close();
      });

      client.join(session, DefaultMediaReceiver, function(error, application) {
        application.getStatus(function(moo, cow) {
          application.pause(function(moo, cow) {
            console.log(moo);
            console.log(cow);

          });

    });

  });
}
*/
