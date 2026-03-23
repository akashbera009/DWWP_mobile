// import messaging, {
//   FirebaseMessagingTypes,
// } from '@react-native-firebase/messaging';

import notifee, {
    EventType,
    Event,
} from '@notifee/react-native';

// import { navigate } from './navigationRef';
// import { getOrCreateUser } from './user';
// import { serverLink } from './common';

// let interval: ReturnType<typeof setInterval> | null = null;

// /**
//  * -------------------------
//  * BACKGROUND MESSAGE HANDLER
//  * -------------------------
//  */
// export const registerFirebaseBackgroundHandler = (): void => {
//   messaging().setBackgroundMessageHandler(
//     async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
//       const title: string = remoteMessage?.data?.title as string ?? '';
//       const body: string = remoteMessage?.data?.body as string ?? '';
// console.log('registration done ');

//       const channelId = await notifee.createChannel({
//         id: 'default2',
//         name: 'Default Channel',
//         importance: AndroidImportance.HIGH,
//       });

//       await notifee.displayNotification({
//         title,
//         body,
//         data: remoteMessage?.data,
//         android: {
//           channelId,
//           sound: 'hollow',
//           autoCancel: true,
//           color: '#af724c',
//           smallIcon: 'ic_launcher_foreground',
//           badgeIconType: AndroidBadgeIconType.SMALL,
//           importance: AndroidImportance.HIGH,
//           style: {
//             type: AndroidStyle.BIGPICTURE,
//             picture: 'https://imgs.search.brave.com/sIT_rkJ_HDXYstSOy2NQ99Wa_Y1LOuuaouxUEoAuBLA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ibG9n/Z2VyLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9pbWcvYi9SMjl2/WjJ4bC9BVnZYc0Vn/VDlld3p4Yi1tSEpu/STNsQWVGVjVzclgz/NTIwZlVqeFBVZ0FB/VXlZUWZSekNfcTY2/Ukk0TWpfbjBRSkdL/RVlhRFBRZldjbnFy/cjdxQmp0S1FERDFk/d2doUE9OcXdqdGQ4/WGhCczlCdWN5dGpB/ckI5b3hYcWhueG1V/TFNURXRwMEdaZ0hY/bzh3RzFaYXcvczY0/MC1ydy9hbGwtYWJv/dXQtZG9ncy5qcGc',
//           },
//           pressAction: { id: 'default' },
//           actions: [
//             {
//               title: 'mark as read',
//               pressAction: { id: 'mark-read' },
//             },
//             {
//               title: 'open chat',
//               pressAction: { id: 'chats' },
//             },
//             {
//               title: 'reply',
//               pressAction: { id: 'reply' },
//               input: {
//                 allowFreeFormInput: true,
//                 editableChoices: true,
//                 placeholder: 'Reply...',
//               },
//             },
//           ],
//         },
//       });
//     }
//   );
// };

// /**
//  * -------------------------
//  * BACKGROUND EVENTS
//  * -------------------------
//  */
export const registerNotifeeBackgroundEvents = (): void => {
    notifee.onBackgroundEvent(async ({ type, detail }: Event) => {
        const { notification, pressAction } = detail;

        if (type === EventType.ACTION_PRESS && pressAction) {
            console.log('User pressed an action.', pressAction);
        }

        if (type === EventType.PRESS && notification?.data) {
            console.log('User pressed the notification.', notification);
            handleNotificationNavigationFromData(notification.data);
        }
    });
};

// /**
//  * -------------------------
//  * FOREGROUND EVENTS
//  * -------------------------
//  */
export const registerNotifeeForegroundEvents = (): void => {
    notifee.onForegroundEvent(async ({ type, detail }: Event) => {
        console.log('Foreground event received:', type, detail);
        if (detail.notification?.id) {
            await notifee.cancelNotification(detail.notification.id);
        }
    });
};

// /**
//  * -------------------------
//  * FOREGROUND SERVICE
//  * -------------------------
//  */
// export const registerForegroundService = (): void => {
//   notifee.registerForegroundService(
//     (notification: Notification) => {
//       return new Promise<void>((resolve) => {
//         let progress = 0;

//         interval = setInterval(async () => {
//           progress += 10;

//           await notifee.displayNotification({
//             id: notification.id,
//             title: 'Downloading...',
//             body: `${progress}% completed`,
//             android: {
//               ...notification.android,
//               progress: {
//                 max: 100,
//                 current: progress,
//               },
//             },
//           });

//           if (progress >= 100) {
//             if (interval) {
//               clearInterval(interval);
//               interval = null;
//             }
//             await notifee.stopForegroundService();
//             resolve();
//           }
//         }, 1500);
//       });
//     }
//   );
// };

// /**
//  * -------------------------
//  * REPLY HANDLER
//  * -------------------------
//  */
// const handleReply = async (
//   detail: Event['detail']
// ): Promise<void> => {
//   try {
//     const user = await getOrCreateUser();

//     await fetch(`${serverLink}/message`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         text: detail.input ?? '',
//         senderId: user.userId,
//         senderName: user.userName ?? '',
//       }),
//     });
//   } catch (error) {
//     console.log('Reply failed:', error);
//   }
// };



export const handleNotificationNavigationFromData = (data?: {
    [key: string]: any;
}) => {
    if (!data) {
        return;
    }

    // const moduleName = data?.module;

    // if (moduleName === 'PRODUCT_NAVIGATION') {
    //     const productId = data?.productId;
    //     navigationRef(data?.screen || 'ProductDetails', { productId });
    // } else if (moduleName === 'ALL_PRODUCTS_SCREEN') {
    //     navigate('ProductPage');
    // } else {
    //     console.log('No navigation action defined for module:', moduleName, "going to home");
    //     navigate('Home');
    // }
};
