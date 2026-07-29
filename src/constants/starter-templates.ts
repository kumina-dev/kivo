import type { StarterTemplate } from '@/types/template'

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'programming',
    version: 1,
    name: 'Programming',
    description:
      'Build consistent development habits and make progress on coding projects.',
    tasks: [
      {
        templateItemKey: 'code-30-minutes',
        title: 'Code for 30 minutes',
        description:
          'Spend at least 30 focused minutes working on a programming project.',
        points: 15,
        repeatRule: 'daily',
      },
      {
        templateItemKey: 'finish-small-issue',
        title: 'Finish one small issue',
        description:
          'Complete one clearly scoped bug fix, improvement or project task.',
        points: 25,
        repeatRule: 'none',
      },
      {
        templateItemKey: 'review-backlog',
        title: 'Review project backlog',
        description:
          'Review open tasks and decide what should be worked on next.',
        points: 10,
        repeatRule: 'weekly',
      },
      {
        templateItemKey: 'meaningful-commit',
        title: 'Commit meaningful progress',
        description:
          'Create a clear commit containing a useful unit of work.',
        points: 10,
        repeatRule: 'weekdays',
      },
    ],
    rewards: [
      {
        templateItemKey: 'gaming-hour',
        title: 'Play a game for one hour',
        description:
          'Take a guilt-free gaming break after earning enough points.',
        cost: 80,
      },
      {
        templateItemKey: 'developer-tool',
        title: 'Buy a small developer tool',
        description:
          'Use points toward a small app, asset or development tool.',
        cost: 300,
      },
    ],
  },
  {
    id: 'adhd',
    version: 1,
    name: 'ADHD',
    description:
      'Reduce friction with small tasks, visible priorities and short focus sessions.',
    tasks: [
      {
        templateItemKey: 'choose-top-three',
        title: 'Choose today’s top 3 tasks',
        description:
          'Decide which three tasks matter most before starting the day.',
        points: 10,
        repeatRule: 'daily',
      },
      {
        templateItemKey: 'focus-session',
        title: 'Complete a 25-minute focus session',
        description:
          'Work on one task without switching context for 25 minutes.',
        points: 15,
        repeatRule: 'daily',
      },
      {
        templateItemKey: 'clear-backlog-item',
        title: 'Clear one small backlog item',
        description:
          'Finish one task that has been lingering unnecessarily.',
        points: 10,
        repeatRule: 'daily',
      },
      {
        templateItemKey: 'prepare-first-task',
        title: 'Prepare tomorrow’s first task',
        description:
          'Make it obvious what to begin with the following day.',
        points: 10,
        repeatRule: 'daily',
      },
    ],
    rewards: [
      {
        templateItemKey: 'watch-episode',
        title: 'Watch one episode',
        description:
          'Watch one episode of a show without treating it as accidental procrastination.',
        cost: 60,
      },
      {
        templateItemKey: 'favorite-meal',
        title: 'Order a favorite meal',
        description:
          'Use accumulated points for a planned treat.',
        cost: 250,
      },
    ],
  },
  {
    id: 'chores',
    version: 1,
    name: 'Chores',
    description:
      'Handle routine cleaning and maintenance before the home becomes an archaeological site.',
    tasks: [
      {
        templateItemKey: 'take-out-trash',
        title: 'Take out the trash',
        points: 5,
        repeatRule: 'weekly',
      },
      {
        templateItemKey: 'do-dishes',
        title: 'Do the dishes',
        points: 10,
        repeatRule: 'daily',
      },
      {
        templateItemKey: 'do-laundry',
        title: 'Do laundry',
        points: 15,
        repeatRule: 'weekly',
      },
      {
        templateItemKey: 'clean-bathroom',
        title: 'Clean the bathroom',
        points: 25,
        repeatRule: 'weekly',
      },
      {
        templateItemKey: 'vacuum-floors',
        title: 'Vacuum the floors',
        points: 20,
        repeatRule: 'weekly',
      },
    ],
    rewards: [
      {
        templateItemKey: 'relax-hour',
        title: 'Relax for one hour',
        description:
          'Take an intentional break after handling household work.',
        cost: 70,
      },
    ],
  },
  {
    id: 'household',
    version: 1,
    name: 'Household',
    description:
      'Plan supplies, groceries and shared home responsibilities.',
    tasks: [
      {
        templateItemKey: 'plan-groceries',
        title: 'Plan weekly groceries',
        points: 15,
        repeatRule: 'weekly',
      },
      {
        templateItemKey: 'check-supplies',
        title: 'Check household supplies',
        description:
          'Check essentials such as cleaning products and toiletries.',
        points: 10,
        repeatRule: 'weekly',
      },
      {
        templateItemKey: 'tidy-common-area',
        title: 'Tidy the common area',
        points: 15,
        repeatRule: 'daily',
      },
      {
        templateItemKey: 'review-expenses',
        title: 'Review upcoming household expenses',
        points: 20,
        repeatRule: 'monthly',
      },
    ],
    rewards: [
      {
        templateItemKey: 'movie-night',
        title: 'Plan a movie night',
        description:
          'Use points for a relaxed evening at home.',
        cost: 120,
      },
    ],
  },
  {
    id: 'fitness',
    version: 1,
    name: 'Fitness',
    description:
      'Support workouts, recovery and basic preparation without turning existence into a boot camp.',
    tasks: [
      {
        templateItemKey: 'complete-workout',
        title: 'Complete a workout',
        points: 30,
        repeatRule: 'none',
      },
      {
        templateItemKey: 'prepare-gym-clothes',
        title: 'Prepare gym clothes',
        description:
          'Set out everything needed for the next workout.',
        points: 5,
        repeatRule: 'none',
      },
      {
        templateItemKey: 'log-activity',
        title: 'Log today’s activity',
        points: 10,
        repeatRule: 'daily',
      },
      {
        templateItemKey: 'recovery-walk',
        title: 'Take a recovery walk',
        description:
          'Go for a comfortable walk to support recovery and general movement.',
        points: 15,
        repeatRule: 'none',
      },
    ],
    rewards: [
      {
        templateItemKey: 'workout-gear',
        title: 'Buy new workout gear',
        description:
          'Save points toward useful training clothing or equipment.',
        cost: 400,
      },
      {
        templateItemKey: 'rest-evening',
        title: 'Take a full rest evening',
        description:
          'Reserve an evening for recovery and low-effort activities.',
        cost: 100,
      },
    ],
  },
]
