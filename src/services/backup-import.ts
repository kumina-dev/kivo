import * as DocumentPicker from 'expo-document-picker'
import { File } from 'expo-file-system'
import type { SQLiteDatabase } from 'expo-sqlite'

import { getBackupSummary } from '@/db/backup'
import { replaceDatabaseFromBackup } from '@/db/backup-import'
import { kivoBackupSchema } from '@/lib/backup-schema'
import type {
  BackupSummary,
  KivoBackup,
} from '@/types/backup'

const maximumBackupSizeBytes = 10 * 1024 * 1024

export type SelectedBackup = {
  backup: KivoBackup
  fileName: string
  summary: BackupSummary
}

export type SelectBackupResult =
  | {
      canceled: true
    }
  | {
      canceled: false
      selection: SelectedBackup
    }

export async function selectBackupFile(): Promise<SelectBackupResult> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['application/json', 'text/json', 'text/plain'],
  })

  if (result.canceled) {
    return {
      canceled: true,
    }
  }

  const asset = result.assets[0]

  if (
    asset.size !== undefined &&
    asset.size > maximumBackupSizeBytes
  ) {
    throw new Error('BACKUP_TOO_LARGE')
  }

  const file = new File(asset.uri)
  const contents = await file.text()

  let rawBackup: unknown

  try {
    rawBackup = JSON.parse(contents)
  } catch {
    throw new Error('INVALID_JSON')
  }

  const validation = kivoBackupSchema.safeParse(rawBackup)

  if (!validation.success) {
    console.error(
      'Invalid Kivo backup:',
      validation.error.issues,
    )

    throw new Error('INVALID_BACKUP')
  }

  const backup: KivoBackup = {
    ...validation.data,
    data: {
      ...validation.data.data,
      tasks: validation.data.data.tasks.map((task) => ({
        ...task,
        source_template_id:
          task.source_template_id ?? null,
        source_template_version:
          task.source_template_version ?? null,
        source_template_item_key:
          task.source_template_item_key ?? null,
      })),
      rewards: validation.data.data.rewards.map(
        (reward) => ({
          ...reward,
          source_template_id:
            reward.source_template_id ?? null,
          source_template_version:
            reward.source_template_version ?? null,
          source_template_item_key:
            reward.source_template_item_key ?? null,
        }),
      ),
    },
  }

  return {
    canceled: false,
    selection: {
      backup,
      fileName: asset.name,
      summary: getBackupSummary(backup),
    },
  }
}

export async function importSelectedBackup(
  db: SQLiteDatabase,
  selection: SelectedBackup,
): Promise<void> {
  await replaceDatabaseFromBackup(db, selection.backup)
}
