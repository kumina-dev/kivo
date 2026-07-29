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
  TemplateInstallationState,
  TemplateInstallationStatus,
} from '@/types/template'

type TemplateCardProps = {
  selected: boolean
  status?: TemplateInstallationStatus
  template: StarterTemplate
  onToggle: (id: TemplateId) => void
}

const statusLabels: Record<
  TemplateInstallationState,
  string
> = {
  'not-installed': 'Not added',
  partial: 'Partially added',
  installed: 'Added',
  'update-available': 'Update available',
}

export function TemplateCard({
  onToggle,
  selected,
  status,
  template,
}: TemplateCardProps) {
  const fullyInstalled =
    status?.state === 'installed'

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected,
        disabled: fullyInstalled,
      }}
      disabled={fullyInstalled}
      onPress={() => onToggle(template.id)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        fullyInstalled && styles.installedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.heading}>
          <View style={styles.titleRow}>
            <AppText style={styles.title}>
              {template.name}
            </AppText>

            {status ? (
              <View
                style={[
                  styles.statusBadge,
                  status.state === 'installed' &&
                    styles.installedBadge,
                  status.state ===
                    'update-available' &&
                    styles.updateBadge,
                ]}
              >
                <AppText
                  style={[
                    styles.statusLabel,
                    status.state === 'installed' &&
                      styles.installedLabel,
                    status.state ===
                      'update-available' &&
                      styles.updateLabel,
                  ]}
                >
                  {statusLabels[status.state]}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText variant="caption">
            {template.tasks.length} tasks ·{' '}
            {template.rewards.length} rewards
          </AppText>
        </View>

        <View
          style={[
            styles.checkbox,
            selected && styles.selectedCheckbox,
            fullyInstalled &&
              styles.installedCheckbox,
          ]}
        >
          {selected || fullyInstalled ? (
            <AppText style={styles.checkmark}>
              ✓
            </AppText>
          ) : null}
        </View>
      </View>

      <AppText variant="caption">
        {template.description}
      </AppText>

      {status &&
      status.state !== 'not-installed' ? (
        <AppText style={styles.installedCounts}>
          {status.installedTasks}/
          {status.totalTasks} tasks ·{' '}
          {status.installedRewards}/
          {status.totalRewards} rewards installed
        </AppText>
      ) : null}
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
  installedCard: {
    opacity: 0.72,
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
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  installedBadge: {
    backgroundColor: 'rgba(111, 214, 157, 0.12)',
  },
  updateBadge: {
    backgroundColor: 'rgba(239, 190, 108, 0.12)',
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  installedLabel: {
    color: colors.success,
  },
  updateLabel: {
    color: colors.warning,
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
  installedCheckbox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  installedCounts: {
    color: colors.textMuted,
    fontSize: 12,
  },
})
