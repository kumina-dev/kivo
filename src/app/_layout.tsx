import { Stack } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { colors } from '@/constants/theme'
import { migrateDatabase } from '@/db/migrations'

import { AppDialog } from '@/components/ui/app-dialog'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import { useEffect } from 'react'

function useNotificationNavigation(): void {
  useEffect(() => {
    function openNotification(
      notification: Notifications.Notification,
    ): void {
      const url =
        notification.request.content.data?.url

      if (url === '/tasks') {
        router.push('/tasks')
      }
    }

    const lastResponse =
      Notifications.getLastNotificationResponse()

    if (lastResponse?.notification) {
      openNotification(
        lastResponse.notification,
      )
    }

    const subscription =
      Notifications
        .addNotificationResponseReceivedListener(
          (response) => {
            openNotification(
              response.notification,
            )
          },
        )

    return () => {
      subscription.remove()
    }
  }, [])
}

export default function RootLayout() {
  useNotificationNavigation()

  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName="kivo.db"
        onInit={migrateDatabase}
      >
        <StatusBar style="light" />

        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: colors.background,
            },
            headerBackButtonDisplayMode: 'minimal',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="tasks"
            options={{ title: 'Tasks' }}
          />

          <Stack.Screen
            name="task-create"
            options={{
              presentation: 'modal',
              title: 'Create task',
            }}
          />

          <Stack.Screen
            name="task/[id]"
            options={{
              title: 'Edit task',
            }}
          />

          <Stack.Screen
            name="rewards"
            options={{ title: 'Rewards' }}
          />

          <Stack.Screen
            name="reward-create"
            options={{
              presentation: 'modal',
              title: 'Create reward',
            }}
          />

          <Stack.Screen
            name="reward/[id]"
            options={{
              title: 'Edit reward',
            }}
          />

          <Stack.Screen
            name="history"
            options={{ title: 'History' }}
          />

          <Stack.Screen
            name="settings"
            options={{ title: 'Settings' }}
          />

          <Stack.Screen
            name="archive"
            options={{
              title: 'Archive',
            }}
          />

          <Stack.Screen
            name="statistics"
            options={{
              title: 'Statistics',
            }}
          />

          <Stack.Screen
            name="calendar"
            options={{
              title: 'Calendar',
            }}
          />

          <Stack.Screen
            name="achievements"
            options={{
              title: 'Achievements',
            }}
          />

          <Stack.Screen
            name="templates"
            options={{
              title: 'Starter templates',
            }}
          />
        </Stack>

        <AppDialog />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
