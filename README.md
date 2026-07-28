# Plantly

A plant-watering reminder app, built while following the
[Intermediate React Native v2](https://kadikraman.github.io/intermediate-react-native-v2-course/docs/intro)
course by Kadi Kraman. The course goes past the basics and past Expo Go,
building a real app from scratch and introducing native tooling (dev builds,
deep linking, signing, store deployment) as it's needed.

## Tech stack

- Expo SDK `~56.0.8`, React Native `0.85.3`, React `19.2.3`
- TypeScript `~6.0.3` in `strict` mode
- [Expo Router](https://docs.expo.dev/versions/v56.0.0/router/introduction/) — file-based navigation
- [Zustand](https://github.com/pmndrs/zustand) — app state (plants, user/onboarding)
- `@react-native-async-storage/async-storage` — local persistence
- `expo-image-picker` + `expo-file-system` — picking a photo and copying it into local storage
- `expo-linear-gradient`, `expo-haptics`, `@expo/vector-icons` — UI polish

## Getting started

```bash
npm start          # Start the Expo dev server (Metro)
npm run ios        # Start and open in the iOS simulator
npm run android    # Start and open on Android
npm run web        # Start and open in the browser
npm run lint       # Run ESLint via `expo lint`
```

There is no test runner configured yet.

> **Note:** This project pins recent, sometimes breaking-change versions.
> Confirm APIs against the [versioned Expo SDK 56 docs](https://docs.expo.dev/versions/v56.0.0/)
> before assuming something works the way an older tutorial or Stack Overflow
> answer describes.

## Project structure

```
app/
  _layout.tsx                     # Root layout
  onboarding.tsx                  # First-run onboarding screen
  newPlant.tsx                    # Modal for adding a new plant
  (tabs)/
    _layout.tsx                   # Bottom tab navigator
    profile.tsx
    (home)/
      _layout.tsx                 # Nested stack inside the Home tab
      index.tsx                   # Plant list
      plants/[plantId].tsx        # Dynamic route — plant detail screen
components/
  PlantCard.tsx
  PlantlyButton.tsx
  PlantlyImage.tsx
store/
  plantsStore.ts                  # Zustand store for plant data
  userStore.ts                    # Zustand store for onboarding/user state
theme.ts
```

## Key learnings so far

Roughly in the order they were introduced while building the app:

- **File-based routing with Expo Router** — route groups like `(tabs)` and
  `(home)` organize navigation without affecting the URL, and nesting a stack
  inside a tab (`(tabs)/(home)/_layout.tsx`) lets a single tab push its own
  screens.
- **Dynamic routes** — `plants/[plantId].tsx` reads the id from the URL/params
  to show a specific plant's details.
- **Picking and storing images** — `expo-image-picker` grabs a photo from the
  device, then `expo-file-system` copies it into the app's local sandbox so
  the reference doesn't break if the original is deleted from the camera roll.
- **Custom UI primitives** — a reusable themed button (`PlantlyButton`),
  gradient backgrounds (`expo-linear-gradient`), and haptic feedback
  (`expo-haptics`) on key interactions.
- **Path aliasing** — cleaner imports instead of long relative paths.
- **Moving off Expo Go** and setting up native/dev builds so the
  app can run on simulators with full native module support (see
  [Development build](https://kadikraman.github.io/intermediate-react-native-v2-course/docs/development-build)
  in the course).

## Additional learnings

### Deep linking (reference)

Course page: [Deep Linking](https://kadikraman.github.io/intermediate-react-native-v2-course/docs/deep-linking)

Because Expo Router is file-based, every screen already has an unambiguous
URL — deep linking mostly comes for free once a URL **scheme** is registered.
`app.json` in this project already has:

```json
"scheme": "plantly"
```

A bare `plantly://` opens the home screen; a path opens a specific screen,
e.g. `plantly://plants/1`.

**Testing on a simulator/emulator**, using the [`uri-scheme`](https://www.npmjs.com/package/uri-scheme) CLI:

```bash
# iOS Simulator
npx uri-scheme open plantly://plants/1 --ios

# Android Emulator
npx uri-scheme open plantly://plants/1 --android
```

**Testing on a real device:**

- **iOS** — type the link directly into Safari; it'll prompt to open the app.
- **Android** — typing a custom-scheme link into a mobile browser doesn't
  reliably work. Workaround: open a live HTML editor (e.g.
  [htmledit.squarefree.com](https://htmledit.squarefree.com)) on the device,
  type `<a href="plantly://plants/1">Click me</a>`, and tap the rendered link.

**Query params** work the same as any URL, e.g.
`npx uri-scheme open "plantly://plants/1?action=water" --ios`, and are
readable from the target screen's `params`. The course uses this to
auto-trigger a "water this plant" action in a `useEffect` when the app opens
via that link. The same `params` mechanism works for in-app navigation with
Expo Router's `Link` component, not just external deep links.

**Gotcha:** deep-linking straight into a nested screen (like a plant detail
page) from a fully closed app can leave no way to navigate back, since there's
no screen underneath it in the stack. Fix: set `initialRouteName` via
`unstable_settings` in the relevant `_layout.tsx` so a proper back button
appears. It's called "unstable" only because it doesn't work with async
routes — otherwise it's safe to use.

## Build signing (reference)

Course page: [Build Signing](https://kadikraman.github.io/intermediate-react-native-v2-course/docs/build-signing)

Signing exists so app stores/OSes can verify a build came from a known
source and prevent installing malicious apps. iOS and Android take very
different approaches.

**Android** — signs with a **Keystore** file:

- The project already ships a debug keystore at `android/app/debug.keystore`
  (referenced from `android/app/build.gradle`) — fine for local dev builds.
- Production releases need a separate **upload keystore**. Google verifies
  uploads against it, then manages the real production keystore on your
  behalf (Play App Signing).

**iOS** — signing is much more restrictive; there are three build types,
each needing a matching **Provisioning Profile** + **Signing Certificate**:

| Build type  | Requires                               | Notes                                                                                                             |
| ----------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Development | Development profile + Development cert | Installed directly on a connected device via Xcode; only method that works without a paid Apple Developer account |
| Ad Hoc      | Ad Hoc profile + Distribution cert     | Needs a paid account; only installs on devices registered in that profile                                         |
| Production  | Production profile + Distribution cert | For TestFlight/App Store only — can't be installed directly on a device                                           |

To create a Development build manually via Xcode: connect the iPhone, open
the `ios` folder in Xcode, go to **Signing & Capabilities**, sign in with any
Apple ID, select "Your Name's Personal Team," set the phone as the run
target, build, then approve the developer certificate under
Settings → General → VPN & Device Management on the phone.

**Recommended shortcut:** use `eas build` to generate and manage the non-dev
credentials automatically instead of doing this by hand — add `--local` to
build on your own machine instead of Expo's cloud builders. See also Expo's
[EAS credentials docs](https://docs.expo.dev/app-signing/app-credentials/).

## Deploying to stores (reference)

Course page: [Deploying to Stores](https://kadikraman.github.io/intermediate-react-native-v2-course/docs/deploying-to-stores)

1. **Get a developer account**
   - Android: Google Play Developer account, one-time $25 fee.
   - iOS: Apple Developer Program, $99/year.
   - Individual accounts require identity verification (can take a few days);
     note your full legal address becomes public on paid app store pages.
2. **Create the app listing** on each store's console.
3. **Build the production app** — different from a dev build: signed for
   distribution and store-optimized.
   - Android: `.aab` (Android App Bundle), not `.apk` — lets Google Play
     generate a right-sized binary per device.
   - iOS: `.ipa`, signed with the Production profile + Distribution cert.
4. **Upload it**
   - Android: first upload is manual (drag-and-drop in Play Console); later
     ones can use `eas submit`.
   - iOS: Transporter app, `eas submit`, or Xcode.
5. **Fill in store metadata** — data/privacy disclosures, app purpose,
   countries, pricing, name/tagline/description/keywords.
6. **Add images** — screenshots (need to accurately represent the app, not
   necessarily literal captures) plus, for Android, a banner and icon.
7. **Test before release**
   - iOS TestFlight: Internal (your dev account's team) or External
     (email/link invite, brief review required).
   - Android: internal (≤100 users), closed (email invite), or open (public,
     shows a "Pre-release" label) tracks. Personal Google accounts need at
     least 20 opted-in testers for 14+ days before production access opens up
     — business accounts skip this requirement.
8. **Review** — both stores run automated + manual checks, typically hours to
   several days. Common rejection reasons: crashes on launch, reviewer can't
   log in, unclear permission usage, or features that don't obviously work.
   You can respond to reviewers or resubmit a fixed build.
