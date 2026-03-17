import notifee, { AndroidBadgeIconType, AndroidImportance, AndroidStyle } from '@notifee/react-native';
import colors from './colors';

// type notofication = 
type notificationType = {
    body: string | undefined;
    title: string | undefined;
    data?: { [key: string]: any };
}
export const displayNotification = async ({ title, body, data }: notificationType) => {

    try {
        // Required for iOS
        await notifee.requestPermission()

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'Payment Channel ID',
            name: 'Payment Channel',
            importance: AndroidImportance.HIGH,
            sound: 'ring_drop',
        });

        // Display a notification
        await notifee.displayNotification({

            title: `<span style="color: #4caf50;"><b>${title}</b></span>`,
            subtitle: '&#127881;',
            body:
                `<span style="text-decoration: line-through;">${body}</span>` +
                `<span style="color:#ffffff; background-color:#9c27b0;"><i>${data?.type}</i></span> &#127881;!`,
            android: {
                channelId,
                sound: 'ring_drop',
                color: colors.primary,
                smallIcon: 'ic_launcher',
                largeIcon: 'https://github.com/akashbera009/DWWP_2.0/blob/main/DWWP%20LOGO.png?raw=true',
                badgeIconType: AndroidBadgeIconType.SMALL,  // badge 
                importance: AndroidImportance.HIGH,// importance
                // style: {
                //   type: AndroidStyle.BIGPICTURE,
                //   picture: 'https://imgs.search.brave.com/sIT_rkJ_HDXYstSOy2NQ99Wa_Y1LOuuaouxUEoAuBLA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ibG9n/Z2VyLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9pbWcvYi9SMjl2/WjJ4bC9BVnZYc0Vn/VDlld3p4Yi1tSEpu/STNsQWVGVjVzclgz/NTIwZlVqeFBVZ0FB/VXlZUWZSekNfcTY2/Ukk0TWpfbjBRSkdL/RVlhRFBRZldjbnFy/cjdxQmp0S1FERDFk/d2doUE9OcXdqdGQ4/WGhCczlCdWN5dGpB/ckI5b3hYcWhueG1V/TFNURXRwMEdaZ0hY/bzh3RzFaYXcvczY0/MC1ydy9hbGwtYWJv/dXQtZG9ncy5qcGc',
                // },
                // style: {
                //     type: AndroidStyle.BIGTEXT,
                //     text: 'Ypur recharge has been done .'
                // },
                // style: {
                //   type: AndroidStyle.INBOX,
                //   lines: ['First Message', 'Second Message', 'Third Message', 'Forth Message'],
                // },

                pressAction: {
                    id: 'default',
                },
                actions: [
                    {
                        title: 'Done',
                        pressAction: { id: 'mark-read' }
                    }
                ],
                badgeCount: 0,
            },
            ios: {
                attachments: [
                    {
                        // Local file path.
                        url: 'https://player.cloudinary.com/embed/?cloud_name=dilxiy8fa&public_id=steak_video_qng8ej',
                        thumbnailTime: 3, // optional
                    },
                ],
                foregroundPresentationOptions: {
                    badge: true,
                    sound: true,
                    banner: true,
                    list: true,
                },
                // sound: 'hollow.wav',
                interruptionLevel: 'timeSensitive',
                categoryId: 'post',
                summaryArgument: 'John',
                summaryArgumentCount: 10,
            }
        });
    } catch (error) {
        console.log(error)
    }
}