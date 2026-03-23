import notifee, { AndroidBadgeIconType, AndroidImportance } from '@notifee/react-native';
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

            title: `${title}`,
            subtitle: `${data?.type}`,
            body:
                `${body}` +
                `${data?.type}!`,
            android: {
                channelId,
                sound: 'ring_drop',
                color: colors.black,
                smallIcon: 'ic_launcher_foreground',
                largeIcon: 'https://github.com/akashbera009/DWWP_2.0/blob/main/DWWP%20LOGO.png?raw=true',
                badgeIconType: AndroidBadgeIconType.SMALL,  // badge 
                importance: AndroidImportance.HIGH,// importance
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