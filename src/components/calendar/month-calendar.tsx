import { StyleSheet, View } from 'react-native'

import { CalendarDay } from '@/components/calendar/calendar-day'
import { AppText } from '@/components/ui/app-text'
import { spacing } from '@/constants/theme'
import type { CalendarDayActivity } from '@/types/calendar'
import {
  getCalendarGridDates,
  getLocalDateKey,
  isSameMonth,
} from '@/utils/calendar'

type MonthCalendarProps = {
  activity: CalendarDayActivity[]
  month: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

const weekdayLabels = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
]

export function MonthCalendar({
  activity,
  month,
  onSelectDate,
  selectedDate,
}: MonthCalendarProps) {
  const today = new Date()
  const gridDates = getCalendarGridDates(month)

  const activityByDate = new Map(
    activity.map((day) => [day.date, day]),
  )

  return (
    <View style={styles.container}>
      <View style={styles.weekdays}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekday}>
            <AppText
              variant="caption"
              style={styles.weekdayLabel}
            >
              {label}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {gridDates.map((date) => {
          const dateKey = getLocalDateKey(date)

          return (
            <View key={dateKey} style={styles.dayWrapper}>
              <CalendarDay
                activity={activityByDate.get(dateKey)}
                currentMonth={isSameMonth(date, month)}
                date={date}
                onPress={() => onSelectDate(date)}
                selected={
                  dateKey === getLocalDateKey(selectedDate)
                }
                today={
                  dateKey === getLocalDateKey(today)
                }
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  weekdays: {
    flexDirection: 'row',
  },
  weekday: {
    alignItems: 'center',
    flex: 1,
  },
  weekdayLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayWrapper: {
    padding: 2,
    width: `${100 / 7}%`,
  },
})
