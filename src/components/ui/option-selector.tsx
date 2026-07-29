import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/constants/theme'

type Option<T extends string> = {
  label: string
  value: T
}

type OptionSelectorProps<T extends string> = {
  label: string
  onChange: (value: T) => void
  options: readonly Option<T>[]
  value: T
}

export function OptionSelector<T extends string>({
  label,
  onChange,
  options,
  value,
}: OptionSelectorProps<T>) {
  return (
    <View style={styles.container}>
      <AppText style={styles.label}>{label}</AppText>

      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selectedOption,
                pressed && styles.pressedOption,
              ]}
            >
              <AppText
                style={[
                  styles.optionText,
                  selected && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </AppText>
            </Pressable>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedOption: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  pressedOption: {
    opacity: 0.75,
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: colors.text,
  },
})
