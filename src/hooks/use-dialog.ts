import { useDialogStore } from '@/stores/dialog-store'
import type { DialogOptions } from '@/types/dialog'

type UseDialogResult = {
  closeDialog: () => void
  showDialog: (options: DialogOptions) => void
}

export function useDialog(): UseDialogResult {
  const closeDialog = useDialogStore(
    (state) => state.closeDialog,
  )

  const showDialog = useDialogStore(
    (state) => state.openDialog,
  )

  return {
    closeDialog,
    showDialog,
  }
}
