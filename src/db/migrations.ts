import type { SQLiteDatabase } from 'expo-sqlite'

const databaseVersion = 1

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL;')
  await db.execAsync('PRAGMA foreign_keys = ON;')

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  )

  let currentVersion = result?.user_version ?? 0

  if (currentVersion >= databaseVersion) {
    return
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        points INTEGER NOT NULL CHECK (points > 0),
        repeat_rule TEXT NOT NULL DEFAULT 'none'
          CHECK (
            repeat_rule IN (
              'none',
              'daily',
              'weekdays',
              'weekly',
              'monthly'
            )
          ),
        created_at TEXT NOT NULL,
        archived_at TEXT
      );

      CREATE INDEX tasks_archived_at_index
      ON tasks (archived_at);
    `)

    currentVersion = 1
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion};`)
}
