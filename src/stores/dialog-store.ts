import { create } from 'zustand'

import type {
  DialogAction,
  DialogOptions,
  DialogState,
} from '@/types/dialog'

type DialogStore = DialogState & {
  closeDialog: () => void
  openDialog: (options: DialogOptions) => void
  runAction: (action: DialogAction) => Promise<void>
}

const initialState: DialogState = {
  actions: [],
  dismissible: true,
  message: undefined,
  title: '',
  visible: false,
}

export const useDialogStore = create<DialogStore>(
  (set, get) => ({
    ...initialState,

    openDialog: (options) => {
      set({
        actions: options.actions ?? [
          {
            label: 'OK',
            variant: 'primary',
          },
        ],
        dismissible: options.dismissible ?? true,
        message: options.message,
        title: options.title,
        visible: true,
      })
    },

    closeDialog: () => {
      set(initialState)
    },

    runAction: async (action) => {
      get().closeDialog()
      await action.onPress?.()
    },
  }),
)
