import { Stack } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { colors } from '@/constants/theme'
import { migrateDatabase } from '@/db/migrations'

export default function RootLayout() {
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
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
