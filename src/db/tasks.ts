import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  CreateTaskInput,
  RepeatRule,
  Task,
} from '@/types/task'
import {
  getCompletionPeriod,
  isTaskAvailableToday,
} from '@/utils/date'

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

const taskColumns = `
  id,
  title,
  description,
  points,
  repeat_rule,
  created_at,
  archived_at
`

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

export async function getTaskById(
  db: SQLiteDatabase,
  taskId: number,
): Promise<Task | null> {
  const row = await db.getFirstAsync<TaskRow>(
    `
      SELECT ${taskColumns}
      FROM tasks
      WHERE id = ?
    `,
    taskId,
  )

  return row ? mapTask(row) : null
}

export async function getActiveTasks(
  db: SQLiteDatabase,
): Promise<Task[]> {
  const rows = await db.getAllAsync<TaskRow>(`
    SELECT ${taskColumns}
    FROM tasks
    WHERE archived_at IS NULL
    ORDER BY created_at DESC
  `)

  return rows.map(mapTask)
}

export async function getArchivedTasks(
  db: SQLiteDatabase,
): Promise<Task[]> {
  const rows = await db.getAllAsync<TaskRow>(`
    SELECT ${taskColumns}
    FROM tasks
    WHERE archived_at IS NOT NULL
    ORDER BY archived_at DESC, id DESC
  `)

  return rows.map(mapTask)
}

export async function getAvailableTasks(
  db: SQLiteDatabase,
  date = new Date(),
): Promise<Task[]> {
  const tasks = await getActiveTasks(db)

  const eligibleTasks = tasks.filter((task) =>
    isTaskAvailableToday(task.repeatRule, date),
  )

  const availableTasks = await Promise.all(
    eligibleTasks.map(async (task) => {
      const completionPeriod = getCompletionPeriod(
        task.repeatRule,
        date,
      )

      const completion = await db.getFirstAsync<{ id: number }>(
        `
          SELECT id
          FROM task_completions
          WHERE task_id = ?
            AND completion_period = ?
        `,
        task.id,
        completionPeriod,
      )

      return completion ? null : task
    }),
  )

  return availableTasks.filter(
    (task): task is Task => task !== null,
  )
}

export async function updateTask(
  db: SQLiteDatabase,
  taskId: number,
  input: CreateTaskInput,
): Promise<void> {
  await db.runAsync(
    `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        points = ?,
        repeat_rule = ?
      WHERE id = ?
        AND archived_at IS NULL
    `,
    input.title.trim(),
    input.description?.trim() || null,
    input.points,
    input.repeatRule,
    taskId,
  )
}

export async function completeTask(
  db: SQLiteDatabase,
  task: Task,
): Promise<void> {
  const completedAt = new Date().toISOString()
  const completionPeriod = getCompletionPeriod(task.repeatRule)

  await db.withTransactionAsync(async () => {
    const activeTask = await db.getFirstAsync<{
      id: number
      points: number
      repeat_rule: RepeatRule
    }>(
      `
        SELECT id, points, repeat_rule
        FROM tasks
        WHERE id = ?
          AND archived_at IS NULL
      `,
      task.id,
    )

    if (!activeTask) {
      throw new Error('TASK_NOT_AVAILABLE')
    }

    await db.runAsync(
      `
        INSERT INTO task_completions (
          task_id,
          completion_period,
          completed_at
        )
        VALUES (?, ?, ?)
      `,
      activeTask.id,
      completionPeriod,
      completedAt,
    )

    await db.runAsync(
      `
        INSERT INTO point_transactions (
          type,
          amount,
          task_id,
          created_at
        )
        VALUES ('task_completion', ?, ?, ?)
      `,
      activeTask.points,
      activeTask.id,
      completedAt,
    )

    if (activeTask.repeat_rule === 'none') {
      await db.runAsync(
        `
          UPDATE tasks
          SET archived_at = ?
          WHERE id = ?
        `,
        completedAt,
        activeTask.id,
      )
    }
  })
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
        AND archived_at IS NULL
    `,
    new Date().toISOString(),
    taskId,
  )
}

export async function restoreTask(
  db: SQLiteDatabase,
  taskId: number,
): Promise<void> {
  const result = await db.runAsync(
    `
      UPDATE tasks
      SET archived_at = NULL
      WHERE id = ?
        AND archived_at IS NOT NULL
    `,
    taskId,
  )

  if (result.changes === 0) {
    throw new Error('TASK_NOT_ARCHIVED')
  }
}
