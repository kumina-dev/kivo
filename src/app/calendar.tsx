import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { MonthCalendar } from '@/components/calendar/month-calendar'
import { MonthNavigation } from '@/components/calendar/month-navigation'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import { getCalendarMonthActivity } from '@/db/calendar'
import type { CalendarMonthActivity } from '@/types/calendar'
import {
  addMonths,
  getLocalDateKey,
  getMonthStart,
  isSameMonth,
} from '@/utils/calendar'

export default function CalendarScreen() {
  const db = useSQLiteContext()

  const currentMonth = getMonthStart(new Date())

  const [month, setMonth] = useState(currentMonth)
  const [selectedDate, setSelectedDate] =
    useState(new Date())
  const [activity, setActivity] =
    useState<CalendarMonthActivity>()
  const [loading, setLoading] = useState(true)

  const loadMonth = useCallback(
    async (targetMonth: Date): Promise<void> => {
      setLoading(true)

      try {
        const nextActivity =
          await getCalendarMonthActivity(
            db,
            targetMonth,
          )

        setActivity(nextActivity)
      } catch (error) {
        console.error(error)

        Alert.alert(
          'Could not load calendar',
          'Something went wrong while loading monthly activity.',
        )
      } finally {
        setLoading(false)
      }
    },
    [db],
  )

  useFocusEffect(
    useCallback(() => {
      void loadMonth(month)
    }, [loadMonth, month]),
  )

  const selectedActivity = useMemo(() => {
    const selectedDateKey =
      getLocalDateKey(selectedDate)

    return activity?.days.find(
      (day) => day.date === selectedDateKey,
    )
  }, [activity, selectedDate])

  function handlePreviousMonth(): void {
    const nextMonth = addMonths(month, -1)

    setMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  function handleNextMonth(): void {
    if (isSameMonth(month, currentMonth)) {
      return
    }

    const nextMonth = addMonths(month, 1)

    setMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  function handleSelectDate(date: Date): void {
    if (!isSameMonth(date, month)) {
      const nextMonth = getMonthStart(date)

      setMonth(nextMonth)
    }

    setSelectedDate(date)
  }

  const selectedDateLabel =
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(selectedDate)

  return (
    <Screen>
      <View style={styles.content}>
        <MonthNavigation
          month={month}
          nextDisabled={isSameMonth(
            month,
            currentMonth,
          )}
          onNext={handleNextMonth}
          onPrevious={handlePreviousMonth}
        />

        <Card style={styles.calendarCard}>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <MonthCalendar
              activity={activity?.days ?? []}
              month={month}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
            />
          )}
        </Card>

        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <AppText variant="caption">
              Tasks completed
            </AppText>

            <AppText style={styles.summaryValue}>
              {activity?.taskCompletions.toLocaleString(
                'en-US',
              ) ?? '0'}
            </AppText>
          </Card>

          <Card style={styles.summaryCard}>
            <AppText variant="caption">
              Points earned
            </AppText>

            <AppText style={styles.summaryValue}>
              {activity?.pointsEarned.toLocaleString(
                'en-US',
              ) ?? '0'}
            </AppText>
          </Card>
        </View>

        <Card style={styles.dayCard}>
          <AppText variant="heading">
            {selectedDateLabel}
          </AppText>

          {selectedActivity ? (
            <View style={styles.dayStats}>
              <View style={styles.dayStatRow}>
                <AppText variant="caption">
                  Tasks completed
                </AppText>

                <AppText style={styles.dayStatValue}>
                  {selectedActivity.taskCompletions.toLocaleString(
                    'en-US',
                  )}
                </AppText>
              </View>

              <View style={styles.dayStatRow}>
                <AppText variant="caption">
                  Points earned
                </AppText>

                <AppText style={styles.dayStatValue}>
                  +
                  {selectedActivity.pointsEarned.toLocaleString(
                    'en-US',
                  )}
                </AppText>
              </View>
            </View>
          ) : (
            <AppText variant="caption">
              No task completions on this day.
            </AppText>
          )}
        </Card>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  calendarCard: {
    paddingHorizontal: spacing.sm,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 380,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    gap: spacing.sm,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  dayCard: {
    gap: spacing.lg,
  },
  dayStats: {
    gap: spacing.md,
  },
  dayStatRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayStatValue: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
})
