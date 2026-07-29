import { StyleSheet, View } from 'react-native'

import { colors, radius } from '@/constants/theme'

type AchievementProgressProps = {
  progress: number
  unlocked: boolean
}

export function AchievementProgress({
  progress,
  unlocked,
}: AchievementProgressProps) {
  const normalizedProgress = Math.min(
    Math.max(progress, 0),
    1,
  )

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          unlocked && styles.unlockedFill,
          {
            width: `${normalizedProgress * 100}%`,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    height: '100%',
  },
  unlockedFill: {
    backgroundColor: colors.success,
  },
})
