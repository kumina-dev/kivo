import { z } from 'zod'

const isoDateStringSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  'Expected a valid date string',
)

const nullableTextSchema = z.string().nullable()

const taskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  description: nullableTextSchema,
  points: z.number().int().positive(),
  repeat_rule: z.enum([
    'none',
    'daily',
    'weekdays',
    'weekly',
    'monthly',
  ]),
  created_at: isoDateStringSchema,
  archived_at: isoDateStringSchema.nullable(),
  source_template_id: z.string().nullable().optional(),
  source_template_version:
    z.number().int().positive().nullable().optional(),
  source_template_item_key:
    z.string().min(1).nullable().optional(),
})

const taskCompletionSchema = z.object({
  id: z.number().int().positive(),
  task_id: z.number().int().positive(),
  completion_period: z.string().min(1),
  completed_at: isoDateStringSchema,
})

const rewardSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  description: nullableTextSchema,
  cost: z.number().int().positive(),
  created_at: isoDateStringSchema,
  archived_at: isoDateStringSchema.nullable(),
  source_template_id: z.string().nullable().optional(),
  source_template_version:
    z.number().int().positive().nullable().optional(),
  source_template_item_key:
    z.string().min(1).nullable().optional(),
})

const pointTransactionSchema = z
  .object({
    id: z.number().int().positive(),
    type: z.enum([
      'task_completion',
      'reward_redemption',
      'manual_adjustment',
    ]),
    amount: z.number().int(),
    task_id: z.number().int().positive().nullable(),
    reward_id: z.number().int().positive().nullable(),
    note: nullableTextSchema,
    created_at: isoDateStringSchema,
  })
  .superRefine((transaction, context) => {
    if (
      transaction.type === 'task_completion' &&
      transaction.task_id === null
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'Task completion transactions must reference a task',
        path: ['task_id'],
      })
    }

    if (
      transaction.type === 'reward_redemption' &&
      transaction.reward_id === null
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'Reward redemption transactions must reference a reward',
        path: ['reward_id'],
      })
    }
  })

const notificationSettingsSchema = z.object({
  daily_reminder_enabled: z.union([
    z.literal(0),
    z.literal(1),
  ]),
  daily_reminder_hour: z.number().int().min(0).max(23),
  daily_reminder_minute: z.number().int().min(0).max(59),
})

export const kivoBackupSchema = z
  .object({
    application: z.literal('kivo'),
    formatVersion: z.literal(1),
    exportedAt: isoDateStringSchema,
    data: z.object({
      tasks: z.array(taskSchema),
      taskCompletions: z.array(taskCompletionSchema),
      rewards: z.array(rewardSchema),
      pointTransactions: z.array(pointTransactionSchema),
      notificationSettings:
        notificationSettingsSchema.nullable(),
    }),
  })
  .superRefine((backup, context) => {
    const taskIds = new Set(
      backup.data.tasks.map((task) => task.id),
    )

    const rewardIds = new Set(
      backup.data.rewards.map((reward) => reward.id),
    )

    for (const [
      index,
      completion,
    ] of backup.data.taskCompletions.entries()) {
      if (!taskIds.has(completion.task_id)) {
        context.addIssue({
          code: 'custom',
          message: `Completion references missing task ${completion.task_id}`,
          path: ['data', 'taskCompletions', index, 'task_id'],
        })
      }
    }

    for (const [
      index,
      transaction,
    ] of backup.data.pointTransactions.entries()) {
      if (
        transaction.task_id !== null &&
        !taskIds.has(transaction.task_id)
      ) {
        context.addIssue({
          code: 'custom',
          message: `Transaction references missing task ${transaction.task_id}`,
          path: [
            'data',
            'pointTransactions',
            index,
            'task_id',
          ],
        })
      }

      if (
        transaction.reward_id !== null &&
        !rewardIds.has(transaction.reward_id)
      ) {
        context.addIssue({
          code: 'custom',
          message: `Transaction references missing reward ${transaction.reward_id}`,
          path: [
            'data',
            'pointTransactions',
            index,
            'reward_id',
          ],
        })
      }
    }
  })
