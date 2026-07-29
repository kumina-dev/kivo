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

type TemplateRewardReviewItemProps = {
  cost: number
  description?: string
  enabled: boolean
  title: string
  onChangeCost: (cost: number) => void
  onChangeDescription: (description: string) => void
  onChangeTitle: (title: string) => void
  onToggle: () => void
}

export function TemplateRewardReviewItem({
  cost,
  description = '',
  enabled,
  onChangeCost,
  onChangeDescription,
  onChangeTitle,
  onToggle,
  title,
}: TemplateRewardReviewItemProps) {
  function handleCostChange(text: string): void {
    const digitsOnly = text.replace(/\D/g, '')
    const parsedValue = Number.parseInt(
      digitsOnly,
      10,
    )

    onChangeCost(
      Number.isNaN(parsedValue)
        ? 0
        : parsedValue,
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
        accessibilityState={{
          checked: enabled,
        }}
        onPress={onToggle}
        style={[
          styles.checkbox,
          enabled && styles.selectedCheckbox,
        ]}
      >
        {enabled ? (
          <AppText style={styles.checkmark}>
            ✓
          </AppText>
        ) : null}
      </Pressable>

      <View style={styles.fields}>
        <TextInput
          editable={enabled}
          onChangeText={onChangeTitle}
          placeholder="Reward title"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[
            styles.titleInput,
            !enabled && styles.disabledInput,
          ]}
          value={title}
        />

        <TextInput
          editable={enabled}
          multiline
          onChangeText={onChangeDescription}
          placeholder="Description (optional)"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[
            styles.descriptionInput,
            !enabled && styles.disabledInput,
          ]}
          textAlignVertical="top"
          value={description}
        />

        <View style={styles.valueRow}>
          <AppText variant="caption">
            Cost
          </AppText>

          <TextInput
            editable={enabled}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={handleCostChange}
            selectionColor={colors.accent}
            style={[
              styles.valueInput,
              !enabled && styles.disabledInput,
            ]}
            value={String(cost)}
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
  descriptionInput: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    minHeight: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
