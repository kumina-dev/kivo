import type { StarterTemplate } from '@/types/template'

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'programming',
    name: 'Programming',
    description:
      'Build consistent development habits and make progress on coding projects.',
    tasks: [
      {
        title: 'Code for 30 minutes',
        description:
          'Spend at least 30 focused minutes working on a programming project.',
        points: 15,
        repeatRule: 'daily',
      },
      {
        title: 'Finish one small issue',
        description:
          'Complete one clearly scoped bug fix, improvement or project task.',
        points: 25,
        repeatRule: 'none',
      },
      {
        title: 'Review project backlog',
        description:
          'Review open tasks and decide what should be worked on next.',
        points: 10,
        repeatRule: 'weekly',
      },
      {
        title: 'Commit meaningful progress',
        description:
          'Create a clear commit containing a useful unit of work.',
        points: 10,
        repeatRule: 'weekdays',
      },
    ],
    rewards: [
      {
        title: 'Play a game for one hour',
        description:
          'Take a guilt-free gaming break after earning enough points.',
        cost: 80,
      },
      {
        title: 'Buy a small developer tool',
        description:
          'Use points toward a small app, asset or development tool.',
        cost: 300,
      },
    ],
  },
  {
    id: 'adhd',
    name: 'ADHD',
    description:
      'Reduce friction with small tasks, visible priorities and short focus sessions.',
    tasks: [
      {
        title: 'Choose today’s top 3 tasks',
        description:
          'Decide which three tasks matter most before starting the day.',
        points: 10,
        repeatRule: 'daily',
      },
      {
        title: 'Complete a 25-minute focus session',
        description:
          'Work on one task without switching context for 25 minutes.',
        points: 15,
        repeatRule: 'daily',
      },
      {
        title: 'Clear one small backlog item',
        description:
          'Finish one task that has been lingering unnecessarily.',
        points: 10,
        repeatRule: 'daily',
      },
      {
        title: 'Prepare tomorrow’s first task',
        description:
          'Make it obvious what to begin with the following day.',
        points: 10,
        repeatRule: 'daily',
      },
    ],
    rewards: [
      {
        title: 'Watch one episode',
        description:
          'Watch one episode of a show without treating it as accidental procrastination.',
        cost: 60,
      },
      {
        title: 'Order a favorite meal',
        description:
          'Use accumulated points for a planned treat.',
        cost: 250,
      },
    ],
  },
  {
    id: 'chores',
    name: 'Chores',
    description:
      'Handle routine cleaning and maintenance before the home becomes an archaeological site.',
    tasks: [
      {
        title: 'Take out the trash',
        points: 5,
        repeatRule: 'weekly',
      },
      {
        title: 'Do the dishes',
        points: 10,
        repeatRule: 'daily',
      },
      {
        title: 'Do laundry',
        points: 15,
        repeatRule: 'weekly',
      },
      {
        title: 'Clean the bathroom',
        points: 25,
        repeatRule: 'weekly',
      },
      {
        title: 'Vacuum the floors',
        points: 20,
        repeatRule: 'weekly',
      },
    ],
    rewards: [
      {
        title: 'Relax for one hour',
        description:
          'Take an intentional break after handling household work.',
        cost: 70,
      },
    ],
  },
  {
    id: 'household',
    name: 'Household',
    description:
      'Plan supplies, groceries and shared home responsibilities.',
    tasks: [
      {
        title: 'Plan weekly groceries',
        points: 15,
        repeatRule: 'weekly',
      },
      {
        title: 'Check household supplies',
        description:
          'Check essentials such as cleaning products and toiletries.',
        points: 10,
        repeatRule: 'weekly',
      },
      {
        title: 'Tidy the common area',
        points: 15,
        repeatRule: 'daily',
      },
      {
        title: 'Review upcoming household expenses',
        points: 20,
        repeatRule: 'monthly',
      },
    ],
    rewards: [
      {
        title: 'Plan a movie night',
        description:
          'Use points for a relaxed evening at home.',
        cost: 120,
      },
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness',
    description:
      'Support workouts, recovery and basic preparation without turning existence into a boot camp.',
    tasks: [
      {
        title: 'Complete a workout',
        points: 30,
        repeatRule: 'none',
      },
      {
        title: 'Prepare gym clothes',
        description:
          'Set out everything needed for the next workout.',
        points: 5,
        repeatRule: 'none',
      },
      {
        title: 'Log today’s activity',
        points: 10,
        repeatRule: 'daily',
      },
      {
        title: 'Take a recovery walk',
        description:
          'Go for a comfortable walk to support recovery and general movement.',
        points: 15,
        repeatRule: 'none',
      },
    ],
    rewards: [
      {
        title: 'Buy new workout gear',
        description:
          'Save points toward useful training clothing or equipment.',
        cost: 400,
      },
      {
        title: 'Take a full rest evening',
        description:
          'Reserve an evening for recovery and low-effort activities.',
        cost: 100,
      },
    ],
  },
]
