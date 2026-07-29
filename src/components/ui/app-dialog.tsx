import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { DialogButton } from '@/components/ui/dialog-button'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'
import { useDialogStore } from '@/stores/dialog-store'

export function AppDialog() {
  const {
    actions,
    closeDialog,
    dismissible,
    message,
    runAction,
    title,
    visible,
  } = useDialogStore()

  function handleBackdropPress(): void {
    if (dismissible) {
      closeDialog()
    }
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleBackdropPress}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close dialog"
          onPress={handleBackdropPress}
          style={StyleSheet.absoluteFill}
        />

        <View
          accessibilityViewIsModal
          style={styles.dialog}
        >
          <View style={styles.content}>
            <AppText style={styles.title}>
              {title}
            </AppText>

            {message ? (
              <AppText
                selectable
                style={styles.message}
                variant="caption"
              >
                {message}
              </AppText>
            ) : null}
          </View>

          <View style={styles.actions}>
            {actions?.map((action, index) => (
              <DialogButton
                key={`${action.label}-${index}`}
                label={action.label}
                onPress={() => {
                  void runAction(action)
                }}
                variant={
                  action.variant ?? 'secondary'
                }
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xl,
    maxWidth: 440,
    padding: spacing.xl,
    width: '100%',
  },
  content: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  message: {
    lineHeight: 21,
  },
  actions: {
    gap: spacing.sm,
  },
})
