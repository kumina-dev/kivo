import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import type { SQLiteDatabase } from 'expo-sqlite'

import {
  createBackup,
  getBackupSummary,
} from '@/db/backup'
import type { BackupSummary } from '@/types/backup'

type ExportBackupResult = {
  fileName: string
  summary: BackupSummary
}

function createBackupFileName(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(
    2,
    '0',
  )
  const second = String(date.getSeconds()).padStart(
    2,
    '0',
  )

  return [
    'kivo-backup',
    `${year}-${month}-${day}`,
    `${hour}-${minute}-${second}`,
  ].join('_') + '.json'
}

export async function exportBackup(
  db: SQLiteDatabase,
): Promise<ExportBackupResult> {
  const sharingAvailable =
    await Sharing.isAvailableAsync()

  if (!sharingAvailable) {
    throw new Error('SHARING_NOT_AVAILABLE')
  }

  const backup = await createBackup(db)
  const fileName = createBackupFileName()

  const file = new File(Paths.cache, fileName)

  file.create({
    overwrite: true,
    intermediates: true,
  })

  file.write(JSON.stringify(backup, null, 2))

  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Export Kivo backup',
    mimeType: 'application/json',
    UTI: 'public.json',
  })

  return {
    fileName,
    summary: getBackupSummary(backup),
  }
}
