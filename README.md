# Kivo

Kivo is a local-first productivity app that turns completed tasks into points and rewards.

The app stores its data locally using SQLite and works without an account, subscription, or cloud connection.

## Features

- Create and manage tasks
- Recurring tasks
- Earn points from completed tasks
- Create and redeem rewards
- Point transaction history
- Manual point adjustments
- Statistics and activity tracking
- Monthly calendar view
- Achievements
- Archived tasks and rewards
- Daily reminders
- JSON backup export

## Tech stack

- React Native
- Expo SDK 55
- Expo Router
- TypeScript
- SQLite
- Expo Notifications
- Expo File System
- Expo Sharing

## Getting started

### Requirements

- Node.js
- pnpm
- Android Studio and an Android emulator, or a physical Android device

### Install dependencies

```bash
pnpm install
```

### Create the native project

```bash
npx expo prebuild
```

### Run on Android

```bash
npx expo run:android --variant debugOptimized
```

For normal TypeScript and React Native development after the development build has been installed:

```bash
npx expo start --dev-client
```

## Project structure

```
src/
├── app/          Expo Router screens and layouts
├── components/   Reusable UI and feature components
├── constants/    Theme and shared constants
├── db/           SQLite queries and migrations
├── services/     Notifications, backups and other services
├── types/        Shared TypeScript types
└── utils/        Shared utility functions
```

## Data storage

Kivo is local-first. Tasks, rewards, completions, point transactions, settings and other app data are stored in SQLite on the device.

Backups can be exported as JSON files from the settings screen.

## Status

Kivo is under active development and is not yet considered production-ready.

## Roadmap

### Core

- [x] Tasks
- [x] Recurring tasks
- [x] Rewards
- [x] Point ledger
- [x] History
- [x] Statistics
- [x] Calendar
- [x] Achievements
- [x] Daily reminders
- [x] Backup export
- [x] Backup import
- [x] Archived tasks and rewards
- [x] Permanent deletion from archive
- [ ] Daily streaks
- [ ] Levels and experience
- [ ] Weekly challenges
- [ ] Negative-point bad habits
- [ ] Multiple point currencies

### Templates and onboarding

- [x] Multi-select starter templates
- [x] Combine selected templates into one personalized setup
- [x] Review and customize suggested tasks and rewards
- [x] Edit titles, descriptions, repeat rules and point values
- [x] Detect duplicate and overlapping template items
- [x] Track template installation status
- [x] Reconcile legacy imported template metadata
- [x] Add only missing items from partially installed templates
- [x] Add and apply templates later from settings
- [ ] Template-based bad habits and weekly challenges
- [ ] Share templates through QR codes
- [ ] Community-created templates

### Data and portability

- [x] Versioned JSON backup format
- [x] Backup import preview and validation
- [ ] CSV export
- [ ] QR backup export
- [ ] QR backup import
- [ ] Encrypted backups
- [ ] Extended backup migration support

### User experience

- [x] Replace system alerts with Kivo-themed dialogs
- [x] Kivo-themed confirmation dialogs
- [x] Improved archive management
- [x] Starter-template review flow
- [ ] Kivo-themed date and time selection
- [ ] Custom bottom sheets
- [ ] Improved empty, loading and error states
- [ ] Themes and appearance customization
- [ ] Improved charts and data visualizations
- [ ] Animations and interaction polish
- [ ] Accessibility improvements
- [ ] Home screen widgets

### Shared households

- [ ] Family and shared households
- [ ] Shared tasks
- [ ] Shared rewards
- [ ] Shared challenges
- [ ] Household roles and permissions
- [ ] Conflict-safe shared activity history

### Cloud and devices

- [ ] Optional accounts
- [ ] Optional cloud sync
- [ ] Device linking
- [ ] Offline conflict resolution
- [ ] Account-free local mode remains fully supported

### Architecture and engineering

- [x] SQLite migrations
- [x] Focused UI state management with Zustand
- [x] Reusable dialog system
- [x] Reusable UI components
- [ ] Refine shared architecture
- [ ] Extract reusable hooks
- [ ] Extract reusable layout components
- [ ] Consolidate theme modules
- [ ] Add schema validation with Zod
- [ ] Adopt FlashList where large lists benefit from it
- [ ] Add Reanimated for interaction and transition polish
- [ ] Evaluate Skia for custom visual effects and charts
- [ ] Adopt a chart solution such as Victory Native XL
- [ ] Automated database tests
- [ ] Automated component tests
- [ ] Automated integration tests
- [ ] GitHub Actions CI
- [ ] Performance profiling and optimization

### Distribution

- [ ] Android release builds
- [ ] iOS release builds
- [ ] Internal testing releases
- [ ] Store-ready screenshots and metadata
- [ ] Privacy policy and data documentation
- [ ] First public release

## License

This project is licensed under the MIT License.
