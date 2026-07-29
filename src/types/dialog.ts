export type DialogActionVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'

export type DialogAction = {
  label: string
  variant?: DialogActionVariant
  onPress?: () => void | Promise<void>
}

export type DialogOptions = {
  title: string
  message?: string
  actions?: DialogAction[]
  dismissible?: boolean
}

export type DialogState = DialogOptions & {
  visible: boolean
}
