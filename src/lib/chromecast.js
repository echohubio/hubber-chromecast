import { Client, DefaultMediaReceiver } from 'castv2-client';
import got from 'got';
import log from 'electron-log';

export const restart = (chromecast) => {
  const uri = `http://${chromecast.addresses[0]}:8008/setup/reboot`;
  const body = {
    params: 'now',
  };

  log.info(`restarting ${chromecast.name}`);

  return got.post(uri, {
    json: true,
    body,
  }).then((response) => {
    const { statusCode, statusMessage, body: responseBody } = response;
    if (statusCode === 200) {
      return { status: 'OK' };
    }

    log.error(`reboot failed: c: ${statusCode} m: ${statusMessage} b: ${responseBody}`);

    return { status: 'RESTART_FAILED' };
  }).catch((err) => {
    log.error(`Failed to restart chromecast: ${err}`);
    return { status: 'RESTART_FAILED' };
  });
};

const client = new Client();

client.on('error', (err) => {
  log.error('Error: %s', err.message);
  client.close();
});

const mediaCommand = (device, command) => new Promise((resolve /* , reject */) => {
  log.info(`running command ${command} on ${device.friendlyName}`);

  client.connect(device.addresses[0], () => {
    log.info(`connected to chromecast ${device.friendlyName}`);

    client.getSessions((err, stat) => {
      log.debug('get session');

      if (err) {
        log.error(err);
        client.close();

        resolve({ status: 'RESTART_FAILED' });
        return;
      }

      const session = stat[0];

      client.join(session, DefaultMediaReceiver, (clientError, application) => {
        log.debug('joined session');
        if (clientError) {
          log.error(clientError);
          client.close();

          resolve({ status: 'RESTART_FAILED' });
          return;
        }

        application.getStatus((applicationError, applicationStatus) => {
          if (applicationError) {
            log.error(applicationError);
            client.close();
            resolve({ status: 'RESTART_FAILED' });
            return;
          }
          log.debug('application status', applicationStatus);

          application[command]((commandError, commandStatus) => {
            if (commandError) {
              log.error(commandError);
              client.close();
              resolve({ status: 'RESTART_FAILED' });
              return;
            }
            log.debug('command status', commandStatus);
            resolve({ status: 'OK' });

            client.close();
          });
        });
      });
    });
  });
});

export const pause = chromecast => mediaCommand(chromecast, 'pause');

export const stop = chromecast => mediaCommand(chromecast, 'stop');

export const play = chromecast => mediaCommand(chromecast, 'play');
