import { useState } from 'react'
import {
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { OptionSelector } from '@/components/ui/option-selector'
import { PrimaryButton } from '@/components/ui/primary-button'
import { TextField } from '@/components/ui/text-field'
import { spacing } from '@/constants/theme'

type AdjustmentDirection = 'add' | 'remove'

type PointAdjustmentFormProps = {
  onSubmit: (input: {
    amount: number
    note?: string
  }) => Promise<void>
}

const directionOptions = [
  {
    label: 'Add points',
    value: 'add',
  },
  {
    label: 'Remove points',
    value: 'remove',
  },
] as const

export function PointAdjustmentForm({
  onSubmit,
}: PointAdjustmentFormProps) {
  const [direction, setDirection] =
    useState<AdjustmentDirection>('add')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [amountError, setAmountError] = useState<string>()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(): Promise<void> {
    const parsedAmount = Number(amount)

    const nextAmountError =
      Number.isInteger(parsedAmount) && parsedAmount > 0
        ? undefined
        : 'Enter a positive whole number.'

    setAmountError(nextAmountError)

    if (nextAmountError) {
      return
    }

    const signedAmount =
      direction === 'add'
        ? parsedAmount
        : -parsedAmount

    try {
      setSaving(true)

      await onSubmit({
        amount: signedAmount,
        note,
      })

      setAmount('')
      setNote('')

      Alert.alert(
        'Balance updated',
        direction === 'add'
          ? `${parsedAmount.toLocaleString('en-US')} points were added.`
          : `${parsedAmount.toLocaleString('en-US')} points were removed.`,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading">
          Adjust point balance
        </AppText>

        <AppText variant="caption">
          Add or remove points without completing a task or redeeming
          a reward.
        </AppText>
      </View>

      <OptionSelector
        label="Adjustment"
        onChange={setDirection}
        options={directionOptions}
        value={direction}
      />

      <TextField
        error={amountError}
        keyboardType="number-pad"
        label="Points"
        maxLength={9}
        onChangeText={(value) => {
          setAmount(value.replace(/[^0-9]/g, ''))

          if (amountError) {
            setAmountError(undefined)
          }
        }}
        placeholder="50"
        value={amount}
      />

      <TextField
        label="Reason"
        maxLength={200}
        onChangeText={setNote}
        placeholder="Optional note"
        value={note}
      />

      <PrimaryButton
        disabled={saving}
        label={
          saving
            ? 'Updating…'
            : direction === 'add'
              ? 'Add points'
              : 'Remove points'
        }
        onPress={() => {
          void handleSubmit()
        }}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
})
