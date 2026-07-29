import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'
import type {
  StarterTemplate,
  TemplateId,
} from '@/types/template'

type TemplateCardProps = {
  selected: boolean
  template: StarterTemplate
  onToggle: (id: TemplateId) => void
}

export function TemplateCard({
  onToggle,
  selected,
  template,
}: TemplateCardProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={() => onToggle(template.id)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText style={styles.title}>
            {template.name}
          </AppText>

          <AppText variant="caption">
            {template.tasks.length} tasks ·{' '}
            {template.rewards.length} rewards
          </AppText>
        </View>

        <View
          style={[
            styles.checkbox,
            selected && styles.selectedCheckbox,
          ]}
        >
          {selected ? (
            <AppText style={styles.checkmark}>
              ✓
            </AppText>
          ) : null}
        </View>
      </View>

      <AppText variant="caption">
        {template.description}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  selectedCard: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.82,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  heading: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
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
})
