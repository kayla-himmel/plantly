# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm start          # Start the Expo dev server (Metro)
npm run ios        # Start and open in the iOS simulator
npm run android    # Start and open on Android
npm run web        # Start and open in the browser
npm run lint       # Run ESLint via `expo lint`
```

There is no test runner configured yet.

## Stack & Versions

This project pins recent, breaking-change versions — confirm APIs against the docs before coding (see AGENTS.md):

- Expo SDK `~56.0.8`, React Native `0.85.3`, React `19.2.3`
- TypeScript `~6.0.3` in `strict` mode (`tsconfig.json` extends `expo/tsconfig.base`)

## Architecture

The app is at the default Expo template stage:

- `index.ts` — entry point; calls `registerRootComponent(App)` so the app boots identically in Expo Go and native builds.
- `App.tsx` — the single root component. All UI currently lives here.

There is no navigation, state management, or feature/folder structure yet — add structure as the app grows rather than assuming it exists.

## Linting

`eslint.config.js` uses the flat-config format and composes `eslint-config-expo/flat`, Prettier (`eslint-plugin-prettier/recommended`), and `eslint-plugin-react-native`. `react-native/no-unused-styles` is set to `error`, so unused `StyleSheet` entries fail lint.
