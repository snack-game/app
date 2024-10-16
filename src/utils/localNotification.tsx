import notifee, { AndroidImportance, AndroidColor } from '@notifee/react-native';

const displayNotification = async (message: any) => {
  await notifee.requestPermission()

  const channelId = await notifee.createChannel({
    id: 'default',
    name: '스낵게임',
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.displayNotification({
    title: message.notification.title,
    body: message.notification.body,
    android: { channelId }
  });
};

export default displayNotification;