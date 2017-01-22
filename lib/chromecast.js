import castV2Client from 'castv2-client';
import phetch from 'phetch';
import Debug from 'debug';

const debug = Debug('hubber:plugin:chromecast');

export const restart = (chromecast) => {
  const uri = `http://${chromecast.addresses[0]}:8008/setup/reboot`;
  const body = {
    params: 'now',
  };

  debug(`restarting ${chromecast.name}`);

  phetch.post(uri)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .json(body)
    .catch((err) => {
      console.error(`Failed to restart chromecast: ${err}`);
    });
};

const Client = castV2Client.Client;
const DefaultMediaReceiver = castV2Client.DefaultMediaReceiver;

const client = new Client();

client.on('error', (err) => {
  console.error('Error: %s', err.message);
  client.close();
});

const mediaCommand = (device, command) => {
  debug(`running command ${command} on ${device.friendlyName}`);

  client.connect(device.addresses[0], () => {
    debug(`connected to chromecast ${device.friendlyName}`);

    client.getSessions((err, stat) => {
      debug('get session');

      if (err) {
        console.error(err);
        client.close();
        return;
      }

      const session = stat[0];

      client.join(session, DefaultMediaReceiver, (clientError, application) => {
        debug('joined session');
        if (clientError) {
          console.error(clientError);
          client.close();
          return;
        }

        application.getStatus((applicationError, applicationStatus) => {
          if (applicationError) {
            console.error(applicationError);
            client.close();
            return;
          }
          debug('application status', applicationStatus);

          application[command]((commandError, commandStatus) => {
            if (commandError) {
              console.error(commandError);
              client.close();
              return;
            }
            debug('command status', commandStatus);

            client.close();
          });
        });
      });
    });
  });
};

export const pause = chromecast => mediaCommand(chromecast, 'pause');

export const stop = chromecast => mediaCommand(chromecast, 'stop');

export const play = chromecast => mediaCommand(chromecast, 'play');

// function stopChromecast(chromecast) {
//   client.connect(chromecast.addresses[0], function() {
//     debug('connected to chromecast ' + chromecast.friendlyName);

//     client.getSessions(function(err, stat) {
//       if (err) {
//         console.log(err);
//         return;
//       }

//       var session = stat[0];

//       client.receiver.stop(session.sessionId, function(moo, cow) {
//         debug('stopped: ', session);
//         console.log(cow);

//         client.close();
//       });

//       client.join(session, DefaultMediaReceiver, function(error, application) {
//         application.getStatus(function(moo, cow) {
//           application.pause(function(moo, cow) {
//             console.log(moo);
//             console.log(cow);

//           });

//     });

//   });
// }
