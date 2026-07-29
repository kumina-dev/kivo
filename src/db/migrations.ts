import type { SQLiteDatabase } from 'expo-sqlite'

const databaseVersion = 4

export async function migrateDatabase(
  db: SQLiteDatabase,
): Promise<void> {
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

  if (currentVersion === 1) {
    await db.execAsync(`
      CREATE TABLE task_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        completion_period TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        FOREIGN KEY (task_id)
          REFERENCES tasks (id)
          ON DELETE CASCADE,
        UNIQUE (task_id, completion_period)
      );

      CREATE INDEX task_completions_task_id_index
      ON task_completions (task_id);

      CREATE INDEX task_completions_completed_at_index
      ON task_completions (completed_at);

      CREATE TABLE point_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL
          CHECK (
            type IN (
              'task_completion',
              'reward_redemption'
            )
          ),
        amount INTEGER NOT NULL,
        task_id INTEGER,
        reward_id INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id)
          REFERENCES tasks (id)
          ON DELETE SET NULL
      );

      CREATE INDEX point_transactions_created_at_index
      ON point_transactions (created_at);

      CREATE INDEX point_transactions_task_id_index
      ON point_transactions (task_id);
    `)

    currentVersion = 2
  }

  if (currentVersion === 2) {
    await db.execAsync(`
      CREATE TABLE rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        cost INTEGER NOT NULL CHECK (cost > 0),
        created_at TEXT NOT NULL,
        archived_at TEXT
      );

      CREATE INDEX rewards_archived_at_index
      ON rewards (archived_at);

      CREATE INDEX point_transactions_reward_id_index
      ON point_transactions (reward_id);
    `)

    currentVersion = 3
  }

  if (currentVersion === 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE point_transactions_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL
            CHECK (
              type IN (
                'task_completion',
                'reward_redemption',
                'manual_adjustment'
              )
            ),
          amount INTEGER NOT NULL,
          task_id INTEGER,
          reward_id INTEGER,
          note TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (task_id)
            REFERENCES tasks (id)
            ON DELETE SET NULL,
          FOREIGN KEY (reward_id)
            REFERENCES rewards (id)
            ON DELETE SET NULL
        );

        INSERT INTO point_transactions_new (
          id,
          type,
          amount,
          task_id,
          reward_id,
          note,
          created_at
        )
        SELECT
          id,
          type,
          amount,
          task_id,
          reward_id,
          NULL,
          created_at
        FROM point_transactions;

        DROP TABLE point_transactions;

        ALTER TABLE point_transactions_new
        RENAME TO point_transactions;

        CREATE INDEX point_transactions_created_at_index
        ON point_transactions (created_at);

        CREATE INDEX point_transactions_task_id_index
        ON point_transactions (task_id);

        CREATE INDEX point_transactions_reward_id_index
        ON point_transactions (reward_id);
      `)
    })

    currentVersion = 4
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion};`)
}
