import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { spacing } from '@/constants/theme'

type StatCardProps = {
  label: string
  value: string
  description?: string
}

export function StatCard({
  description,
  label,
  value,
}: StatCardProps) {
  return (
    <Card style={styles.card}>
      <AppText variant="caption">{label}</AppText>

      <AppText style={styles.value}>{value}</AppText>

      {description ? (
        <View>
          <AppText variant="caption">
            {description}
          </AppText>
        </View>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 140,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
})
