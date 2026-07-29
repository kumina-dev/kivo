import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import type {
  DailyReminderInput,
  NotificationPermissionState,
} from '@/types/notification-settings'

const taskReminderChannelId = 'task-reminders'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function configureNotificationChannel():
Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }

  await Notifications.setNotificationChannelAsync(
    taskReminderChannelId,
    {
      name: 'Task reminders',
      description:
        'Daily reminders to review available Kivo tasks.',
      importance:
        Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 200],
    },
  )
}

export async function getNotificationPermissionState():
Promise<NotificationPermissionState> {
  const permissions =
    await Notifications.getPermissionsAsync()

  if (permissions.status === 'granted') {
    return 'granted'
  }

  if (permissions.status === 'denied') {
    return 'denied'
  }

  return 'undetermined'
}

export async function requestNotificationPermission():
Promise<NotificationPermissionState> {
  await configureNotificationChannel()

  const existingPermission =
    await getNotificationPermissionState()

  if (existingPermission === 'granted') {
    return 'granted'
  }

  const result =
    await Notifications.requestPermissionsAsync()

  if (result.status === 'granted') {
    return 'granted'
  }

  if (result.status === 'denied') {
    return 'denied'
  }

  return 'undetermined'
}

export async function scheduleDailyTaskReminder(
  input: DailyReminderInput,
): Promise<string> {
  if (!input.enabled) {
    throw new Error('REMINDER_NOT_ENABLED')
  }

  await configureNotificationChannel()

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your tasks are waiting',
      body: 'Review today’s tasks and earn some points.',
      sound: 'default',
      data: {
        url: '/tasks',
      },
    },
    trigger: {
      type:
        Notifications
          .SchedulableTriggerInputTypes.DAILY,
      hour: input.hour,
      minute: input.minute,
      channelId:
        Platform.OS === 'android'
          ? taskReminderChannelId
          : undefined,
    },
  })
}

export async function cancelDailyTaskReminder(
  identifier: string | null,
): Promise<void> {
  if (!identifier) {
    return
  }

  await Notifications.cancelScheduledNotificationAsync(
    identifier,
  )
}

export async function replaceDailyTaskReminder(
  previousIdentifier: string | null,
  input: DailyReminderInput,
): Promise<string | null> {
  await cancelDailyTaskReminder(previousIdentifier)

  if (!input.enabled) {
    return null
  }

  return scheduleDailyTaskReminder(input)
}
