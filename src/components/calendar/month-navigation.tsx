import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import {
  colors,
  radius
} from '@/constants/theme'

type MonthNavigationProps = {
  month: Date
  nextDisabled?: boolean
  onNext: () => void
  onPrevious: () => void
}

export function MonthNavigation({
  month,
  nextDisabled = false,
  onNext,
  onPrevious,
}: MonthNavigationProps) {
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(month)

  return (
    <View style={styles.container}>
      <NavigationButton
        label="‹"
        onPress={onPrevious}
      />

      <AppText style={styles.title}>
        {monthLabel}
      </AppText>

      <NavigationButton
        disabled={nextDisabled}
        label="›"
        onPress={onNext}
      />
    </View>
  )
}

type NavigationButtonProps = {
  disabled?: boolean
  label: string
  onPress: () => void
}

function NavigationButton({
  disabled = false,
  label,
  onPress,
}: NavigationButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <AppText style={styles.buttonLabel}>
        {label}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonLabel: {
    fontSize: 26,
    lineHeight: 28,
  },
})
