import castV2Client from 'castv2-client';
import phetch from 'phetch';
import log from 'electron-log';

export const restart = (chromecast) => {
  const uri = `http://${chromecast.addresses[0]}:8008/setup/reboot`;
  const body = {
    params: 'now',
  };

  log.info(`restarting ${chromecast.name}`);

  phetch.post(uri)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .json(body)
    .then()
    .catch((err) => {
      log.error(`Failed to restart chromecast: ${err}`);
    });
};

const Client = castV2Client.Client;
const DefaultMediaReceiver = castV2Client.DefaultMediaReceiver;

const client = new Client();

client.on('error', (err) => {
  log.error('Error: %s', err.message);
  client.close();
});

const mediaCommand = (device, command) => {
  log.info(`running command ${command} on ${device.friendlyName}`);

  client.connect(device.addresses[0], () => {
    log.info(`connected to chromecast ${device.friendlyName}`);

    client.getSessions((err, stat) => {
      log.debug('get session');

      if (err) {
        log.error(err);
        client.close();
        return;
      }

      const session = stat[0];

      client.join(session, DefaultMediaReceiver, (clientError, application) => {
        log.debug('joined session');
        if (clientError) {
          log.error(clientError);
          client.close();
          return;
        }

        application.getStatus((applicationError, applicationStatus) => {
          if (applicationError) {
            log.error(applicationError);
            client.close();
            return;
          }
          log.debug('application status', applicationStatus);

          application[command]((commandError, commandStatus) => {
            if (commandError) {
              log.error(commandError);
              client.close();
              return;
            }
            log.debug('command status', commandStatus);

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
