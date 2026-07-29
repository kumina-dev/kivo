import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { colors, spacing } from '@/constants/theme'

type NavigationCardProps = {
  description: string
  title: string
  onPress: () => void
}

export function NavigationCard({
  description,
  onPress,
  title,
}: NavigationCardProps) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.textContainer}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="caption">{description}</AppText>
      </View>

      <AppText style={styles.arrow}>›</AppText>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: 30,
    marginLeft: spacing.md,
  },
})
