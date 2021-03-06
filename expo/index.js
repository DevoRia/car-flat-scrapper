import { Expo } from 'expo-server-sdk';

const tokens = JSON.parse(process.env.PUSH_TOKENS) || [];

let expo = new Expo();

for (let pushToken of tokens) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
  }
}

export function sendNotification(data) {

  const messages = [];

  if (!data.length) {
    return;
  }

  tokens.forEach((token) => {
    messages.push({
      to: token,
      sound: 'default',
      title: 'Додались нові машинки',
      body: 'Подивись які нові машинки за цей час',
      data: { list: data.map(item => {
          const newItem = {};

          Object.keys(item)
            .filter(key => !['description', 'viewTitle', 'id', 'provider', 'dateUpdate'].includes(key))
            .map(key => newItem[key] = item[key])

          return newItem;
        })
      },
    });
  });

  let chunks = expo.chunkPushNotifications(messages);

  const tickets = [];

  (async () => {
    for (let chunk of chunks) {
      try {
        const ticket = await expo.sendPushNotificationsAsync(chunk);
        console.log('ticket:', ticket);
        tickets.push(ticket);
      } catch (error) {
        console.error(error);
      }
    }
  })();

  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();

}

