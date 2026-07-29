import type { PropsWithChildren } from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, spacing } from '@/constants/theme'

type ScreenProps = PropsWithChildren<
  ScrollViewProps & {
    scrollable?: boolean
  }
>

export function Screen({
  children,
  contentContainerStyle,
  scrollable = true,
  ...props
}: ScreenProps) {
  if (!scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, contentContainerStyle]}>
          {children}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        {...props}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
})
