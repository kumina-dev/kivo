import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { AppText } from '@/components/ui/app-text'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'

type TemplateReviewItemProps = {
  enabled: boolean
  title: string
  value: number
  valueLabel: string
  onChangeTitle: (title: string) => void
  onChangeValue: (value: number) => void
  onToggle: () => void
}

export function TemplateReviewItem({
  enabled,
  onChangeTitle,
  onChangeValue,
  onToggle,
  title,
  value,
  valueLabel,
}: TemplateReviewItemProps) {
  function handleValueChange(text: string): void {
    const digitsOnly = text.replace(/\D/g, '')
    const parsedValue = Number.parseInt(digitsOnly, 10)

    onChangeValue(
      Number.isNaN(parsedValue) ? 0 : parsedValue,
    )
  }

  return (
    <View
      style={[
        styles.container,
        !enabled && styles.disabledContainer,
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: enabled }}
        onPress={onToggle}
        style={[
          styles.checkbox,
          enabled && styles.selectedCheckbox,
        ]}
      >
        {enabled ? (
          <AppText style={styles.checkmark}>✓</AppText>
        ) : null}
      </Pressable>

      <View style={styles.fields}>
        <TextInput
          editable={enabled}
          onChangeText={onChangeTitle}
          placeholder="Title"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[
            styles.titleInput,
            !enabled && styles.disabledInput,
          ]}
          value={title}
        />

        <View style={styles.valueRow}>
          <AppText variant="caption">
            {valueLabel}
          </AppText>

          <TextInput
            editable={enabled}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={handleValueChange}
            selectionColor={colors.accent}
            style={[
              styles.valueInput,
              !enabled && styles.disabledInput,
            ]}
            value={String(value)}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  disabledContainer: {
    opacity: 0.55,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    marginTop: spacing.xs,
    width: 28,
  },
  selectedCheckbox: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  fields: {
    flex: 1,
    gap: spacing.md,
  },
  titleInput: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  valueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  valueInput: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    textAlign: 'right',
    width: 92,
  },
  disabledInput: {
    color: colors.textMuted,
  },
})
