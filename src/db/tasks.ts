import type { SQLiteDatabase } from 'expo-sqlite'

import type { CreateTaskInput, RepeatRule, Task } from '@/types/task'

type TaskRow = {
  id: number
  title: string
  description: string | null
  points: number
  repeat_rule: RepeatRule
  created_at: string
  archived_at: string | null
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    points: row.points,
    repeatRule: row.repeat_rule,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  }
}

export async function createTask(
  db: SQLiteDatabase,
  input: CreateTaskInput,
): Promise<number> {
  const result = await db.runAsync(
    `
      INSERT INTO tasks (
        title,
        description,
        points,
        repeat_rule,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    input.title.trim(),
    input.description?.trim() || null,
    input.points,
    input.repeatRule,
    new Date().toISOString(),
  )

  return result.lastInsertRowId
}

export async function getActiveTasks(
  db: SQLiteDatabase,
): Promise<Task[]> {
  const rows = await db.getAllAsync<TaskRow>(`
    SELECT
      id,
      title,
      description,
      points,
      repeat_rule,
      created_at,
      archived_at
    FROM tasks
    WHERE archived_at IS NULL
    ORDER BY created_at DESC
  `)

  return rows.map(mapTask)
}

export async function archiveTask(
  db: SQLiteDatabase,
  taskId: number,
): Promise<void> {
  await db.runAsync(
    `
      UPDATE tasks
      SET archived_at = ?
      WHERE id = ?
    `,
    new Date().toISOString(),
    taskId,
  )
}
