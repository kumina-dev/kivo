import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'
import type { CalendarDayActivity } from '@/types/calendar'

type CalendarDayProps = {
  activity?: CalendarDayActivity
  currentMonth: boolean
  date: Date
  selected: boolean
  today: boolean
  onPress: () => void
}

export function CalendarDay({
  activity,
  currentMonth,
  date,
  onPress,
  selected,
  today,
}: CalendarDayProps) {
  const hasActivity =
    (activity?.taskCompletions ?? 0) > 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        today && !selected && styles.today,
        pressed && styles.pressed,
      ]}
    >
      <AppText
        style={[
          styles.dayNumber,
          !currentMonth && styles.outsideMonthText,
          selected && styles.selectedText,
        ]}
      >
        {date.getDate()}
      </AppText>

      <View style={styles.activityArea}>
        {hasActivity ? (
          <>
            <View
              style={[
                styles.activityDot,
                selected && styles.selectedDot,
              ]}
            />

            <AppText
              style={[
                styles.activityCount,
                !currentMonth &&
                  styles.outsideMonthText,
                selected && styles.selectedText,
              ]}
            >
              {activity?.taskCompletions}
            </AppText>
          </>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  today: {
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  outsideMonthText: {
    color: colors.textMuted,
    opacity: 0.5,
  },
  selectedText: {
    color: '#ffffff',
  },
  activityArea: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    minHeight: 12,
  },
  activityDot: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    height: 5,
    width: 5,
  },
  selectedDot: {
    backgroundColor: '#ffffff',
  },
  activityCount: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
})
