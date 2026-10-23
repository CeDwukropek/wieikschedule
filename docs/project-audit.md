# Project structure and code audit

Reviewed on 2026-09-05 against commit `3354e43`.

This is the complete review and proposed cleanup plan. Application code has not been refactored or removed as part of this audit. Proposed paths below do not exist yet.

The review covers all **75 tracked files**: 49 in `src`, 6 in `api`, 6 in `public`, 2 in `scripts`, 1 existing document, and 11 root files. Installed dependencies, generated build files, and Git internals are discussed as directories rather than individually audited as project source. The lockfile was inspected as dependency metadata; the CSV was inspected as a dataset; public PNGs were visually inspected. Environment values are not reproduced here.

## Assessment

The top-level separation is sound. The main maintenance problem is that feature ownership is unclear inside `src`, and some old implementations still execute or remain threaded through the component tree.

Most components represent useful functionality. The cleanup should preserve schedule loading, caching of remote data, group sets, external groups, Google login, saved preferences, both calendar views, both exports, and chat. The largest gains come from deleting unused execution paths and extracting coherent responsibilities from `App.js`, `useScheduleManager.js`, and `timetables/index.js`.

There are only two source assets completely unreachable from the browser entry point: `src/App.css` and `src/logo.svg`. That does **not** mean the rest of the code is all necessary: several reachable modules contain unused branches, unused returned values, and duplicate work.

## How the application currently fits together

```text
src/index.js
└── App.js
    ├── useSettings / usePersistSettings
    │   ├── localStorage
    │   ├── useUserId
    │   └── useFirebaseAuth → firebase/firebaseClient → Auth + Firestore
    ├── useScheduleManager
    │   └── timetables/index → supabaseClient → Supabase events
    ├── useDateHelpers
    ├── useEventFiltering
    ├── myPlanApi → firebaseClient → Firebase ID token
    │   └── /api/my-plan/* → Firebase Admin + Supabase Admin
    ├── WeekView / DayView
    │   ├── eventLayout + timeSlotUtils
    │   └── EventCard + EventTooltipWrapper
    ├── FloatingMenu
    │   ├── FloatingSelectionPanel
    │   ├── ControlsPanel
    │   │   ├── GroupFiltersPanel → GroupInput
    │   │   ├── GroupSetManager
    │   │   ├── ExternalGroupSelectionManager
    │   │   ├── ViewModeSwitch + HideLectures
    │   │   └── exportICS + ExportPngBtn
    │   ├── useChatbot → n8nClient + myPlanApi
    │   └── FloatingChatPanel → SlotChoicesMessage → SlotChoiceCard
    └── FAQ
```

`firebaseClient` and `firebase/firebaseClient` in this diagram are two different files. The backend Admin clients are intentionally separate from both browser clients.

## Confirmed cleanup candidates

| Candidate | Evidence in the current code | Recommended change |
| --- | --- | --- |
| Unused React template stylesheet | No import of `src/App.css`; its `.App*` and `.scrollbar-hide` rules are not part of the active stylesheet graph. | Delete the file. |
| Unused React logo | No reference to `src/logo.svg`. The active application icons are different files in `public/`. | Delete this SVG; retain the public icons. |
| Inactive performance reporting | `src/index.js` calls `reportWebVitals()` without a callback; the function does nothing in that case. | Remove the call, module, and direct `web-vitals` dependency together. |
| Unused dependencies | No application/script/test imports of `file-saver` or `@testing-library/user-event`. The current exporters use native DOM download links, and tests use `fireEvent`. | Remove those direct dependencies and regenerate the lockfile. |
| Ignored PostCSS config | The installed `react-scripts/config/webpack.config.js` sets `postcssOptions.config: false` and supplies its own plugins. No repository script invokes a separate PostCSS pipeline. | Remove `postcss.config.js` for the current build setup; do not assume this means PostCSS itself is unnecessary. |
| Duplicate browser Firebase setup | `myPlanApi.js` imports `src/firebaseClient.js`; auth/settings hooks import `src/firebase/firebaseClient.js`. Both initialize Firebase with different validation/normalization. | Consolidate into one browser client module exporting `auth`, `db`, `googleProvider`, and the configuration flag. Update every consumer and test mock. |
| Unused filtered-results cache | `useEventFiltering` computes and persists `filtered`. `App` passes it to `FloatingMenu`, which only reads `computeFiltered`. Rendering computes its events separately in `buildMergedEvents`. | Keep the filtering algorithm as a pure `filterEvents` function. Remove the unused state, effect, 60-day persistent cache, and `filtered` prop. |
| Disabled language-subject selector | `App.js` hardcodes `selectedLectoratSubject = ""` and `shouldShowLectoratSelect = false`, while still building options, updating saved state, and passing callbacks through three components. | Remove this disabled selector and its state/prop chain. Keep the active `Lek1`, `LekN`, and `LekF` group-language filtering. |
| Unreachable desktop group-set layout | The only production `GroupSetManager` call always passes `compact`. The alternative desktop return is never selected. | Keep the rendered compact layout and its functionality. Remove the alternate layout and `compact` prop. |
| Unused date outputs | `useDateHelpers` builds previous/current/next parity, ranges, and `combinedOptions`. The parity/range values that reach `DayView` are ignored; its `combinedOptions` output is not consumed. | Retain the offset/date calculations actually used by navigation. Remove the unused calculations and ignored props. The separate `dayOptions` passed to PNG export is used and must remain. |
| Unused timetable exports | No consumers of `allTimetables`, `defaultTimetable`, or `getCachedTimetableInfoById`. | Remove these exports and their implementations where otherwise unused. Keep the stale-cache checks consumed by `useScheduleManager`. |
| Unused time-slot algorithms | Only `createTimeSlots` is imported from `timeSlotUtils.js`; `getEventsForSlot` and `getEventSpan` have no consumers, and `toMinutes` only supports those functions. | Delete unused functions; retain slot generation and the active collision-layout algorithm. |
| Unused day-name export | `utils.js` exports `dayNames`, but views/navigation use their own arrays. | Remove the unused export; optionally replace repeated active weekday arrays with one well-named constant. |
| Unused view CSS | `.week-header`, `.event-container`, and `.day-event-container` are absent from the JSX. `.hour-even` is defined both in shared CSS and an inline style block. | Remove obsolete selectors and keep one definition of the repeated rule. Preserve active overlay/tooltip styles. |
| Commented-out UI | `EventCard` and `EventTooltipWrapper` contain disabled JSX for event-type rows. | Delete the comments containing old implementations. Preserve comments explaining behavior or platform workarounds. |
| Write-only navigation ref | `aiButtonRef` is assigned to a button but never read. | Remove the ref and its binding; keep the refs used for focus restoration. |
| Unused persisted group projection | `scheduleGroups` is derived from group sets and saved by `App`, but current code never reads it back. | Stop producing/writing this redundant projection once the saved-settings compatibility policy is explicit. Retain `scheduleGroupSets` and `activeGroupSetBySchedule`. |

An unused **export** is not always an unused **function**. `normalizeTeacherDisplay`, `getISOWeekNumber`, and `ChatbotApiError` have internal callers even though no other module imports them. Remove the export modifier where appropriate; only delete the implementation when its internal consumers are also removed. Similarly, unused destructured `node` props in Markdown renderers intentionally prevent those props from being spread onto DOM elements.

## Full file inventory

Each original file appears once in the inventory tables. “Keep” means its purpose remains necessary; it can still benefit from small local improvements. “Review” means local source inspection cannot establish that a manual or external workflow is obsolete.

### Root files: 11

| Current file | What it contains and how it is used | Action and proposed destination |
| --- | --- | --- |
| [.env.example](../.env.example) | Placeholder configuration for AI visibility, the n8n webhook, and Firebase Web SDK fields. It does not list Supabase browser settings, API base URL, or server Admin credentials required elsewhere. | **Update**, keep at root. Document all supported variables in clearly separated browser/server sections with empty secret values. |
| [.env.production](../.env.production) | Only `GENERATE_SOURCEMAP=false`, consumed by the production React build. It is a build flag file, not a duplicate set of application credentials. | **Keep** at root. |
| [.gitignore](../.gitignore) | Excludes dependencies, build/coverage output, local environment files, logs, and Vercel metadata. Has overlapping local-env patterns and extra blank lines. | **Keep**, optionally tidy redundant patterns. Continue excluding generated output. |
| [README.md](../README.md) | CRA template instructions mixed with project setup, architecture, Firebase/Firestore, n8n, and Vercel deployment. Includes a missing `ChatPopup.js` link, redirect-only login wording despite popup-first code, and n8n steps under the Firestore section. | **Rewrite** as a concise project entry point. Move detailed setup/contracts to `docs/setup.md` and the existing events document; link to the architecture document. |
| [events.csv](../events.csv) | A tracked 583,265-byte timetable dataset with 4,696 records. Dates span 2025-05-07 to 2026-06-16. No browser module reads it; `jsonToCsv.js` writes it. | **Review and relocate**, proposed `data/imports/events.csv` if retained as an import/archive artifact. Do not delete merely because it is absent from the browser graph. Its ongoing manual use cannot be inferred locally. |
| [firestore.rules](../firestore.rules) | Owner-scoped reads/writes for `userSettings/{uid}`, limits document fields/settings count, and requires a server timestamp. Deployment is described as a manual Firebase Console operation. | **Keep** at root for the present documented workflow. Document deployment alongside setup; this file does not enforce anything remotely until published. |
| [jsconfig.json](../jsconfig.json) | Editor/compiler settings: ESNext modules, Bundler resolution, ES2024 target, React JSX, strict flags, and TypeScript-extension imports. There is no separate type-check script or TypeScript source. | **Simplify**, keep at root. Remove irrelevant TypeScript-extension settings and redundant strict flags; scope editor analysis to project source. Do not present this file as a tested type-checking pipeline. |
| [package-lock.json](../package-lock.json) | npm lockfile v3 with 1,614 package entries, recording the dependency graph and resolved versions. | **Keep** at root; regenerate through npm when direct dependencies change. Do not hand-prune transitive packages. |
| [package.json](../package.json) | Dependencies, CRA start/build/test commands, Firebase map workaround hooks, GitHub Pages deploy commands, ESLint settings, and browser targets. | **Clean up** direct dependencies and test/build dependency categories. Resolve the Pages/Vercel deployment policy before removing a deployment command. |
| [postcss.config.js](../postcss.config.js) | Declares Tailwind and Autoprefixer plugins, but the current CRA webpack pipeline disables external PostCSS config lookup. | **Remove** for the currently configured pipeline. Inspect dependency relationships separately before removing packages. |
| [tailwind.config.js](../tailwind.config.js) | Source scanning, empty theme/plugin extensions, and a broad safelist of background/text colors. Event cards also derive text classes dynamically from data colors. | **Keep and tighten** at root. Replace the broad safelist with the actual supported palette, covering dynamically generated text colors. Verify generated CSS before deleting classes. |

### Browser entry, application shell, and root components: 25

| Current file | What it contains and how it is used | Action and proposed destination |
| --- | --- | --- |
| [src/index.js](../src/index.js) | Creates the React root, imports global CSS, renders `App` under `StrictMode`, and calls the inactive web-vitals wrapper. | **Keep** the required entry location. Remove inactive metrics wiring; point imports at the new app/global-style paths. |
| [src/setupTests.js](../src/setupTests.js) | Loads jest-dom assertions and mocks the dock SVG to work around the CRA transformer/React element-symbol mismatch. | **Keep** in this convention-based location. Update the SVG mock path when its asset moves. |
| [src/App.js](../src/App.js) | 1,152 lines combining app layout, preference hydration, calendar navigation, schedule/group hooks, base/external/added-event merging, private-plan API calls, local caches, event mapping, optimistic operations, and a large menu-prop assembly. | **Split**, retaining composition in `src/app/App.js`. Extract private-plan state, navigation, event mapping, and schedule merging as described below. Remove disabled selector/cache/parity plumbing before extraction. |
| [src/App.test.js](../src/App.test.js) | One integration test for switching to day view, opening/closing settings, and focusing chat. Mocks auth, persistence, database clients, and Markdown. | **Keep** beside `src/app/App.js`. Update mocks; extend behavior coverage where the refactor changes important state boundaries. |
| [src/App.css](../src/App.css) | Unimported CRA logo/header styling and an unused scrollbar helper. | **Remove**. |
| [src/index.css](../src/index.css) | Tailwind directives, shared custom scrollbar rules, and optimistic-event glow/reduced-motion styles. | **Move** the global portion to `src/styles/global.css`. Move event-specific glow styles beside schedule components if that improves ownership. Preserve Tailwind directive order. |
| [src/logo.svg](../src/logo.svg) | Unused React atom logo from the initial template. | **Remove**. |
| [src/reportWebVitals.js](../src/reportWebVitals.js) | Dynamically imports web-vitals only if given a callback. The only call supplies none. | **Remove** with its entry-point call and dependency. |
| [src/ControlsPanel.js](../src/ControlsPanel.js) | Settings drawer layout and focus management, Google login UI, schedule selection, group controls, external groups, view/filter toggles, and export selection/merging. | **Split and move** to `src/features/settings/SettingsPanel.js`. Extract login UI to auth and export assembly to schedule export logic; remove disabled lektorat props. Keep drawer/focus behavior together. |
| [src/EventCard.js](../src/EventCard.js) | Event tile with subject colors, teacher formatting, time/room/group details, external-plan badge, optimistic state, and removal UI for added events. | **Keep/move** to `src/features/schedule/components/EventCard.js`; remove commented-out JSX. Keep removal API work outside the presentational tile via callbacks. |
| [src/EventTooltipWrapper.js](../src/EventTooltipWrapper.js) | Hover/focus/long-press tooltip, positioning near viewport edges, keyboard dismissal, and repeated event details. | **Keep/move** beside `EventCard`. Remove disabled JSX; review timer cleanup separately. |
| [src/ExportPngBtn.js](../src/ExportPngBtn.js) | Renders the PNG export action, waits for fonts, captures the export ref with `html-to-image`, derives a filename, and downloads through an anchor. | **Keep/move/rename** to `src/features/schedule/export/ExportPngButton.js`. Remove commented `toJpeg` import. Filename/ref behavior is active. |
| [src/exportICS.js](../src/exportICS.js) | Escapes calendar text, builds local-time ICS occurrences from each event's actual dates, generates UIDs, and downloads a Blob. | **Keep/move** to `src/features/schedule/export/exportICS.js`. Preserve escaping and occurrence handling; validate timezone behavior separately. |
| [src/ExternalGroupSelectionManager.js](../src/ExternalGroupSelectionManager.js) | Builds available subjects/types/group values from loaded external timetables and renders grouped selections with add/update/remove controls. Excludes holiday entries from selection options. | **Keep/split/move** to `src/features/schedule/components/ExternalGroupSelections.js`; extract the roughly first 140 lines of pure option-building rules into schedule logic. |
| [src/FAQ.js](../src/FAQ.js) | Accordion of four hardcoded student-resource links and supporting copy. One answer advertises a deadline of 15.12.2025. | **Keep/move** to `src/app/FAQ.js`. Review dated content; do not invent replacement dates or delete the component as unused. |
| [src/GroupFiltersPanel.js](../src/GroupFiltersPanel.js) | Renders one `GroupInput` per timetable group type, plus the never-enabled language-subject dropdown. | **Simplify/move** to `src/features/schedule/components/GroupFiltersPanel.js`. Keep group inputs; remove disabled dropdown and its props. |
| [src/GroupInput.js](../src/GroupInput.js) | Numeric group input with a special text mode for `Lek` language shortcuts. Normalizes displayed prefixes and forwards edits. | **Keep/move** beside group controls. `LekN`/`LekF` are active inputs, distinct from the disabled subject selector. |
| [src/GroupSetManager.js](../src/GroupSetManager.js) | Create/select/rename/delete UI for saved group sets, with largely duplicated compact and desktop layouts. Only compact mode is selected by the app. | **Simplify/move** to `src/features/schedule/components/GroupSetManager.js`. Delete the unused desktop return and mode prop; retain rename focus and last-set deletion guard. |
| [src/HideLectures.js](../src/HideLectures.js) | Generic icon toggle misleadingly named after one of its two uses: lecture visibility and selected-group filtering. Calls a setter-style argument while callers supply toggle callbacks. | **Rename/simplify** to `src/features/settings/FilterToggle.js`, with an explicit pressed state and toggle callback. Keep both actual controls. |
| [src/ViewModeSwitch.js](../src/ViewModeSwitch.js) | Accessible day/week switch shown in settings. The dock also has a separate day/week action. | **Keep/move** to `src/features/settings/ViewModeSwitch.js`. Two UI entry points are not automatically redundant code. |
| [src/myPlanApi.js](../src/myPlanApi.js) | Firebase-token acquisition, common HTTP/JSON/error handling, and add/list/remove API wrappers with input normalization. | **Keep/move** to `src/features/my-plan/myPlanApi.js`; use the consolidated Firebase client. Keep client-side errors and server-side validation as separate responsibilities. |
| [src/firebaseClient.js](../src/firebaseClient.js) | Browser Firebase configuration with trimmed values, Auth initialization, and development-only globals. Used by the private-plan API client. | **Merge**, then remove this location. Retain a single implementation in `src/lib/firebaseClient.js`. Debug globals are optional development behavior, not an application dependency. |
| [src/supabaseClient.js](../src/supabaseClient.js) | Configured-or-null anonymous browser Supabase client and its configuration flag. Reads public timetable data. | **Keep/move** to `src/lib/supabaseClient.js`. It must remain separate from the service-role Admin client. |
| [src/timeSlotUtils.js](../src/timeSlotUtils.js) | Grid slot creation plus older event-slot matching/span helpers. Only slot creation has external consumers. | **Trim/move** to `src/features/schedule/logic/timeSlots.js`. Remove the old placement helpers; active placement uses `eventLayout`. |
| [src/utils.js](../src/utils.js) | Time conversion, an unused abbreviated weekday array, and teacher-name normalization/splitting rules. | **Split** time conversion into `src/utils/time.js` and teacher formatting into `src/features/schedule/logic/teacherDisplay.js`. Remove unused `dayNames`; retain data-normalization rules unless their data issue is verified resolved. |

### Remaining browser source: 24

| Current file | What it contains and how it is used | Action and proposed destination |
| --- | --- | --- |
| [src/Menu/FloatingMenu.js](../src/Menu/FloatingMenu.js) | Persistent dock combining calendar navigation, date selection, settings access, refresh notices, chat input/mode transitions, mobile keyboard positioning, focus restoration, and substantial prop forwarding. | **Move/simplify** to `src/app/navigation/FloatingMenu.js`. Remove obsolete props/ref; keep dock animation and focus state together. Extract feature internals without replacing working interaction code merely to reduce file length. |
| [src/Menu/FloatingMenu.css](../src/Menu/FloatingMenu.css) | Dock geometry, animations, responsive sizing, chat history connection, date picker, notices, focus/reduced-motion styles, and some chat-content styling. | **Keep/move** beside `FloatingMenu.js`. Chat-content-only rules can move with `ChatPanel`; dock geometry and timing should remain together. |
| [src/Menu/FloatingMenu.test.js](../src/Menu/FloatingMenu.test.js) | Nine test cases covering day/week controls, AI-enabled/disabled navigation, date selection and dismissal, refresh retry, persistent chat input/history, and Escape/focus behavior. | **Keep/move** beside the dock. Update mocked component paths; these tests protect the interaction behavior during file moves. |
| [src/Menu/FloatingSelectionPanel.js](../src/Menu/FloatingSelectionPanel.js) | Shared day/week option list with active/current indicators, arrow/Home/End keyboard support, selection callbacks, and focus refs. | **Keep/move/rename** to `src/app/navigation/DateSelectionPanel.js`. The two modes share actual rendering behavior. |
| [src/Menu/FloatingChatPanel.js](../src/Menu/FloatingChatPanel.js) | Message history, status/errors, clear action, scroll-following behavior, Markdown renderers, and slot-choice message dispatch. | **Move/rename** to `src/features/chat/ChatPanel.js`. Keep local `MessageContent` with it unless separately reused; use chat-owned content styles. |
| [src/Menu/Subtract.svg](../src/Menu/Subtract.svg) | Small current-color curved-corner shape used by the dock cap and chat-history connection. Also mocked in test setup. | **Keep/move/rename** to `src/app/navigation/RoundedCorner.svg`. This is an active design asset. |
| [src/View/DayView.js](../src/View/DayView.js) | Selected-day calendar, 07:00–22:00 quarter-hour grid, event collision layout, event cards/tooltips, today indicator, and exported DOM ref. Reads only a subset of props passed by `App`. | **Keep/move** to `src/features/schedule/components/DayView.js`. Remove ignored props at the caller; unify selected-day parsing with navigation where behavior agrees. |
| [src/View/WeekView.js](../src/View/WeekView.js) | Five-day calendar with dates/time labels, mobile horizontal scrolling, per-day collision layout, event cards/tooltips, and exported DOM ref. | **Keep/move** beside `DayView`. Share suitable calendar constants; do not combine both views into an overly configurable component. |
| [src/View/ViewStyles.css](../src/View/ViewStyles.css) | Shared tooltips, calendar containers, time slots, and absolute event overlays, plus obsolete selectors for earlier layout implementations. | **Trim/move/rename** to `src/features/schedule/components/ScheduleView.css`. Remove only verified unused selectors; keep active positioning behavior. |
| [src/chatbot/SlotChoiceCard.js](../src/chatbot/SlotChoiceCard.js) | Suggested make-up session display, date/time formatting, pending/added/error action states, and add callback. Contains its own time arithmetic. | **Keep/move** to `src/features/chat/SlotChoiceCard.js`. Reuse time helpers after preserving input/default behavior; replace raw implementation identifiers in user copy when editing that UI. |
| [src/chatbot/SlotChoicesMessage.js](../src/chatbot/SlotChoicesMessage.js) | Extracts slots from a chat response and maps per-event add states/errors into `SlotChoiceCard`. | **Keep/move** to `src/features/chat/SlotChoicesMessage.js`. This is a useful adapter rather than an unnecessary wrapper. |
| [src/chatbot/n8nClient.js](../src/chatbot/n8nClient.js) | Webhook HTTP transport, 150-second timeout, abort signal composition, group normalization, response parsing, slot normalization, and typed error codes. | **Keep/move** to `src/features/chat/n8nClient.js`. De-export the error class if it stays internal. Keep supported response formats until the external webhook contract is narrowed deliberately. |
| [src/chatbot/useChatbot.js](../src/chatbot/useChatbot.js) | Conversation/draft/status state, message requests, session ID, slot-add API calls, optimistic callbacks, added IDs, and per-slot errors. Returns a `cancelPending` function that no caller uses. | **Keep/move** to `src/features/chat/useChatbot.js`. Give pending-request lifetime a clear owner; do not simply delete cancellation support without checking unmount/reset behavior. Extract private-plan mutation ownership where it reduces duplication. |
| [src/firebase/firebaseClient.js](../src/firebase/firebaseClient.js) | Second browser Firebase setup, providing Auth, Firestore, Google provider, and a configuration flag. Used by auth/settings hooks. | **Merge** into `src/lib/firebaseClient.js` with the other client, then remove this directory. Preserve provider options and Firestore availability. |
| [src/hooks/useDateHelpers.js](../src/hooks/useDateHelpers.js) | Captures today's date, calculates week boundaries/offsets/ranges, default weekday, parity, and legacy option lists. Much of its returned data is unused. | **Replace/simplify** as part of `src/features/schedule/hooks/useScheduleNavigation.js`. Retain actual week-offset math and date limits; remove dead parity/range/option paths. |
| [src/hooks/useEventFiltering.js](../src/hooks/useEventFiltering.js) | Group/date/lecture/language matching and ordering, wrapped in state/effects and a persistent cache whose result is ignored by the current view pipeline. | **Replace** with `src/features/schedule/logic/filterEvents.js`. Preserve the active algorithm; remove unused React/cache machinery and the disabled preferred-subject branch. |
| [src/hooks/useFirebaseAuth.js](../src/hooks/useFirebaseAuth.js) | Session subscription, local persistence setup, redirect-result handling, popup-first Google login with redirect fallback, sign-out, and error/loading state. Invoked by four mounted consumers. | **Keep/move** to `src/features/auth/useFirebaseAuth.js`. Consider a single `AuthProvider.js` owning initialization/subscription so consumers share state instead of repeating effects. |
| [src/hooks/useScheduleManager.js](../src/hooks/useScheduleManager.js) | 801 lines managing timetable choices/loading/refresh, stale checks/retries, selected plan, saved-state hydration, group-set CRUD, active groups, external selections, and derived view data. | **Split** into schedule orchestration, `useTimetableData.js`, and `useGroupSets.js` under `src/features/schedule/hooks/`. Extract shared default-set update logic; preserve refresh/retry semantics. |
| [src/hooks/useScheduleManager.test.js](../src/hooks/useScheduleManager.test.js) | Two tests for forced refresh of current/external schedules, preserving groups, failure retention, and retry. Uses mocked timetable loaders. | **Keep/move** beside the schedule hook. Add coverage for group editing and switching before changing group-state ownership. |
| [src/hooks/useSettings.js](../src/hooks/useSettings.js) | Reads guest/user local preferences, hydrates Firestore settings, carries preferences across login/logout, and exports a second hook that writes local/cloud snapshots while suppressing repeated signatures. | **Keep/move** to `src/features/settings/useSettings.js`. Keep shared persistence conventions together; give auth state one owner and validate hydration/save ordering before simplification. |
| [src/hooks/useUserId.js](../src/hooks/useUserId.js) | Creates/reuses a stable browser guest identifier with a storage-failure fallback, used to namespace local data. | **Keep/move/rename** to `src/features/auth/useGuestId.js`. It is not the Firebase user ID. Preserve its stored key unless performing a migration. |
| [src/timetables/index.js](../src/timetables/index.js) | 810 lines of Supabase queries, database-to-old-JSON mapping, timetable normalization, subject colors/keys, group derivation, date bounds, memory/localStorage caches, staleness checks, and request deduplication. | **Split** into `src/features/schedule/data/timetableApi.js`, `timetableCache.js`, and `normalizeTimetable.js`. Remove unused exports; reduce the legacy-shaped intermediate conversion only after equivalence tests. |
| [src/utils/dateUtils.js](../src/utils/dateUtils.js) | ISO week/parity helpers, Monday calculation, Polish day/month formatting, and the schedule-specific `isLecture` predicate. | **Split/trim**: used date functions to `src/utils/date.js`; lecture classification to schedule filtering. Delete parity helpers together with their dead callers. |
| [src/utils/eventLayout.js](../src/utils/eventLayout.js) | Clips event intervals to the display range, groups connected overlaps, allocates non-overlapping columns, and returns event geometry for both views. | **Keep/move** to `src/features/schedule/logic/eventLayout.js`. This is active, useful domain logic; validate overlapping and adjacent events before modifying it. |

### Server API: 6

| Current file | What it contains and how it is used | Action and proposed destination |
| --- | --- | --- |
| [api/_lib/firebaseAdmin.js](../api/_lib/firebaseAdmin.js) | Lazy Firebase Admin initialization from environment credentials; handles escaped newlines and includes a local `.env` reader for the documented development workaround. | **Keep** server-side at the existing path. The local-env workaround needs an actual local API check before removal. Do not merge it with the browser Firebase client. |
| [api/_lib/requestAuth.js](../api/_lib/requestAuth.js) | Extracts bearer tokens, verifies Firebase ID tokens, returns the UID, and normalizes authorization failures. | **Keep** at the existing path. Review the temporary debug comment/log separately; authentication belongs in shared backend code. |
| [api/_lib/supabaseAdmin.js](../api/_lib/supabaseAdmin.js) | Lazily caches a service-role Supabase client with browser session behavior disabled. Used by every private-plan endpoint. | **Keep** at the existing path; backend-only ownership is correct. |
| [api/my-plan/add-event.js](../api/my-plan/add-event.js) | POST/OPTIONS handling, common HTTP headers, Firebase auth, user-record upsert, event/schedule validation, existing-link lookup, and creation of the user's added-event link. | **Keep endpoint path**, extract repeated HTTP helpers and user lookup/upsert into `api/_lib/http.js` and `api/_lib/users.js`. Preserve response contracts and validation. |
| [api/my-plan/added-events.js](../api/my-plan/added-events.js) | GET/OPTIONS handling, user lookup, schedule/date filters on active added-event links joined to events, and response mapping. | **Keep endpoint path**, share HTTP/user helpers. Keep user lookup read-only: unlike the add operation, listing does not create a user record. |
| [api/my-plan/remove-event.js](../api/my-plan/remove-event.js) | POST/OPTIONS handling, user lookup, ownership/schedule/activity checks, and soft removal with a timestamp. | **Keep endpoint path**, share HTTP/user helpers. Preserve the difference between a missing user and a missing active added-event record. |

Endpoint locations are part of the configured serverless application shape. These files are entry points even though the React bundle does not import them.

### Public assets: 6

| Current file | What it contains and how it is used | Action and proposed destination |
| --- | --- | --- |
| [public/index.html](../public/index.html) | HTML shell, root mount point, favicon/touch-icon/manifest links, viewport/theme settings, and CRA template comments. Still has `lang="en"`, title `React App`, and the template description. | **Keep/update** at its expected path. Use the actual app name, Polish document language, and project description; remove instructional template comments. |
| [public/manifest.json](../public/manifest.json) | App installation metadata: names, three icon references, relative start URL, standalone display, and colors. | **Keep** at the existing path; normalize brand spelling if desired. This file has an active HTML reference. |
| [public/favicon.ico](../public/favicon.ico) | Browser/install icon referenced by HTML and manifest. | **Keep** at the existing path. |
| [public/logo192.png](../public/logo192.png) | Custom calendar/lightbulb project icon, used by the manifest and Apple touch-icon link. | **Keep**; optional rename to `icon-192.png` only with both references updated. It is not the unused React logo. |
| [public/logo512.png](../public/logo512.png) | Larger version of the custom project icon, referenced by the manifest. | **Keep**; optional consistent rename with its manifest reference updated. |
| [public/robots.txt](../public/robots.txt) | Allows crawler access for all user agents. Served as a static file. | **Keep** at the root public path. A crawler-facing file does not require a JavaScript import. |

### Scripts and existing documentation: 3

| Current file | What it contains and how it is used | Action and proposed destination |
| --- | --- | --- |
| [scripts/fix-firebase-sourcemaps.js](../scripts/fix-firebase-sourcemaps.js) | Writes empty files for two missing Firestore source maps when needed. Called by postinstall, prestart, and prebuild. | **Keep provisionally** at its existing path. It is active build tooling. Verify a clean install/build without the patch before deciding it is obsolete; the hardcoded hash merits a documented reason. |
| [scripts/jsonToCsv.js](../scripts/jsonToCsv.js) | Reads all timetable JSON files from `src/timetables`, flattens events to quoted CSV rows, and writes root `events.csv`. The directory now has no JSON inputs. | **Retire or repair as a deliberate import tool**. As currently written, running it would overwrite the tracked dataset with only a header. A retained tool should accept explicit input/output paths and fail on missing inputs; proposed home `scripts/data/jsonToCsv.js`. |
| [docs/events.md](events.md) | Useful Polish documentation of event/user tables, loaders, private-plan endpoints, caches, and environment settings. Some contracts are stale, including idempotency described with `schedule_name` even though code uses `events.faculty` and the user/event link. | **Keep/update** at its current path after code changes. Replace moved links, remove documentation of deleted cache/state, and align API/database descriptions with actual behavior. |

### Local directories outside the tracked-file inventory

| Directory | Purpose | Treatment |
| --- | --- | --- |
| `.git/` | Repository history and metadata. | Keep; not application code and not a cleanup target. |
| `node_modules/` | Installed npm dependency tree. | Keep ignored; recreate through npm when needed. Do not classify each installed file as project clutter. |
| `build/` | Generated production HTML, JavaScript, CSS, and copied public assets. | Keep ignored; rebuild from source. No source refactor should depend on hand-editing it. |

## Proposed final structure

This keeps the existing entry-point and deployment conventions. Subfolders are used where this project already has enough code to justify them. Smaller features can remain flat.

```text
wieikschedule/
├── api/
│   ├── _lib/
│   │   ├── firebaseAdmin.js
│   │   ├── supabaseAdmin.js
│   │   ├── requestAuth.js
│   │   ├── http.js
│   │   └── users.js
│   └── my-plan/
│       ├── add-event.js
│       ├── added-events.js
│       └── remove-event.js
├── src/
│   ├── index.js
│   ├── setupTests.js
│   ├── app/
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── FAQ.js
│   │   └── navigation/
│   │       ├── FloatingMenu.js
│   │       ├── FloatingMenu.css
│   │       ├── FloatingMenu.test.js
│   │       ├── DateSelectionPanel.js
│   │       └── RoundedCorner.svg
│   ├── features/
│   │   ├── schedule/
│   │   │   ├── components/       # Views, event cards/tooltips, group controls
│   │   │   ├── hooks/            # Navigation, timetable state, group-set state
│   │   │   ├── data/             # Database reads, normalization, timetable cache
│   │   │   ├── logic/            # Filtering, merging, layout, group options
│   │   │   └── export/           # PNG action, ICS creation, export selection
│   │   ├── my-plan/
│   │   │   ├── myPlanApi.js
│   │   │   ├── useMyPlanEvents.js
│   │   │   ├── myPlanCache.js
│   │   │   └── eventMappers.js
│   │   ├── chat/
│   │   │   ├── ChatPanel.js
│   │   │   ├── ChatPanel.css
│   │   │   ├── SlotChoicesMessage.js
│   │   │   ├── SlotChoiceCard.js
│   │   │   ├── useChatbot.js
│   │   │   └── n8nClient.js
│   │   ├── auth/
│   │   │   ├── AuthProvider.js
│   │   │   ├── useFirebaseAuth.js
│   │   │   ├── useGuestId.js
│   │   │   └── GoogleSignInButton.js
│   │   └── settings/
│   │       ├── SettingsPanel.js
│   │       ├── FilterToggle.js
│   │       ├── ViewModeSwitch.js
│   │       └── useSettings.js
│   ├── lib/
│   │   ├── firebaseClient.js
│   │   └── supabaseClient.js
│   ├── utils/
│   │   ├── date.js
│   │   └── time.js
│   └── styles/
│       └── global.css
├── public/                       # HTML, manifest, icons, robots
├── scripts/                      # Verified build/data tooling
├── data/imports/                 # Only if the CSV/import workflow is retained
├── docs/
│   ├── setup.md
│   ├── architecture.md
│   ├── events.md
│   └── project-audit.md
├── .env.example
├── .env.production
├── .gitignore
├── firestore.rules
├── jsconfig.json
├── package.json
├── package-lock.json
├── tailwind.config.js
└── README.md
```

Add behavioral tests beside the modules they exercise. The tree shows their placement through the existing examples; it is not a prescription to create an empty test file for every new module. `AuthProvider.js` is justified only if it actually becomes the single owner of the existing repeated auth subscription/setup effects. `ChatPanel.css` should hold content styles; it must not duplicate dock geometry rules.

There is no need for a catch-all global `hooks/`, a catch-all `services/`, a generic component framework, or an `index.js` in every folder. Direct imports and feature ownership are sufficient here.

### Concrete extraction boundaries

| Existing area | Responsibility after cleanup |
| --- | --- |
| `App.js` composition | Connect selected settings/schedule/navigation/private-plan state and render the dock, calendar, and FAQ. Keep network requests, raw event transformation, and localStorage implementations outside it. |
| `useScheduleNavigation.js` | Own the selected week/day, derive selectable dates from timetable bounds, clamp navigation, and expose previous/next/today actions. Consolidate current duplicated day-selection parsing. Preserve the app's independently selected week and day unless intentionally changing that behavior. |
| `useMyPlanEvents.js` | Own loaded added events, selected-week refresh, pending add/remove state, confirmations, and recovery. The hook should be scoped to the current user and plan; obsolete requests must not write into a newer scope. |
| `myPlanCache.js` | Read/write the existing user/plan/week cache shape. Keep TTL, cache keys, and fallback behavior explicit. A file move does not justify invalidating saved user data. |
| `eventMappers.js` | Convert persisted added-event rows and chat slots into the event shape consumed by the views. Share compatible date/time primitives; retain deliberate differences between pending and confirmed IDs. |
| `filterEvents.js` | Pure group, lecture, active language, and exact-week selection. No React state or localStorage. Both views and ICS selection use the same filtering rules. |
| `mergeEvents.js` | Combine base, external, and added events, preserve origin/source metadata, and apply documented deduplication/ordering. Keep date-specific private events distinguishable from timetable entries. |
| `externalGroups.js` | Build subject/type/group options and select events for external selections. Reuse the selection rules for display and ICS rather than keeping separate copies in `App` and `ControlsPanel`. |
| `useTimetableData.js` | Timetable options, selected/extra timetable loading, refresh status, stale refresh, request deduplication integration, and retry behavior. |
| `useGroupSets.js` | Group-set creation/renaming/deletion, active-set selection, normalized group input, and external selections. Use one default-set/update helper instead of repeating object construction in multiple handlers. |
| `timetableApi.js` | Supabase query orchestration and public loader methods. Cache implementation and event normalization live in the adjacent data modules. |
| `timetableCache.js` | Timetable/option memory and localStorage cache state, timestamps, TTL decisions, and explicit cache access. Preserve the current strategy of immediately using cached data while refreshing old data. |
| `normalizeTimetable.js` | Convert fetched rows into schedule entries, groups, subjects/colors, and date bounds. The existing database-row → legacy JSON → view conversion can become a direct conversion once the same outputs are verified. |
| `api/_lib/http.js` | The identical response and CORS helpers used by all three endpoints. Avoid wrapping every endpoint in a new framework for two small shared functions. |
| `api/_lib/users.js` | Shared read-only UID lookup plus the separate upsert operation used by add-event. Do not silently turn list/remove operations into user-creation operations. |

Changing file count is not the objective. Splitting three large mixed-responsibility files will add some files while reducing duplicate implementation and making each feature easier to change.

## Dependency disposition

| Direct dependency or group | Recommendation |
| --- | --- |
| `react`, `react-dom`, `lucide-react` | Keep: active UI/runtime imports. |
| `firebase`, `@supabase/supabase-js` | Keep: Firebase supplies auth/preferences; Supabase supplies event data. They have different active responsibilities. |
| `firebase-admin` | Keep: required by server endpoints, even though it is absent from the browser imports. |
| `html-to-image` | Keep: active PNG export implementation. |
| `react-markdown`, `remark-gfm` | Keep: active assistant-message rendering. |
| `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/dom` | Keep as test dependencies. `dom` is also a required peer of the installed React testing library; absence of a direct app import is not a removal reason. |
| `@testing-library/user-event` | Remove under the current test implementation; all existing interactions use `fireEvent`. |
| `file-saver` | Remove: no current consumer. |
| `web-vitals` | Remove together with the inactive reporting wrapper and entry-point call. |
| `react-scripts` | Keep for this cleanup. It owns start/build/test behavior; changing the build system would be a separate migration and is not needed to fix this structure. |
| `tailwindcss` | Keep: current styling depends on it. |
| `postcss`, `autoprefixer` | Still used in the installed build dependency graph. Reassess whether direct root declarations are needed after removing the ignored config; do not infer that their transitive implementations are unused. |
| `@babel/runtime` | Required by installed Babel/build/testing packages. Its direct root declaration may be redundant, but inspect why the project pinned it and verify a fresh install/build before removing that declaration. |
| `gh-pages` | Referenced by `npm run deploy`; retain until the intended deployment workflow is settled. Local source cannot tell us whether anyone still uses that command. |

Changing `dependencies` versus `devDependencies` should reflect the deployment install/build process. It is organizational cleanup, not evidence that a package has stopped being needed.

## Items requiring behavior checks or a product/workflow decision

These are separate from confirmed dead code. They should not be silently changed while moving files.

1. **Private-plan recovery and request scope.** A failed slot addition sets a chat error but does not explicitly roll back the optimistic row inserted into the calendar/cache. Added-event loading also writes results after `await` without guarding a changed plan/user scope. Add tests around failure and rapid switching before extracting this state, then handle any fixes as explicit behavior changes.
2. **Settings and auth lifecycle.** The auth hook is called by `App`, both settings hooks, and `ControlsPanel`, so persistence setup and redirect-result handling repeat with separate subscriptions. Cloud hydration, guest fallback, login/logout, and signature-based save suppression need coverage before replacing those with a shared provider.
3. **Export expectations.** ICS builds base and external schedule events; it does not include the private added-event state held in `App`. Decide whether that is intended. Check date conversion across timezones and repeated occurrences before rewriting export helpers. Preserve current behavior during pure file moves.
4. **Saved-data compatibility.** Legacy `activeWeekKey` fallback, legacy day-selection tokens, stored guest IDs, cache keys, and settings fields may outlive their current UI. Remove needless *computation/writes* first; keep necessary input compatibility or provide a small migration. A folder cleanup should not reset users' saved groups.
5. **Chat request cancellation.** The hook owns an `AbortController` but its returned cancel action has no caller and there is no unmount cancellation effect. Decide which lifecycle transitions should cancel work, rather than deleting the mechanism because the action is unused.
6. **CSV/import workflow.** No runtime consumer is not proof that an import artifact is expendable. Establish whether the tracked CSV is a manual import, backup, or obsolete migration output. Never run the current converter as a verification command: with missing inputs it overwrites the CSV with a header.
7. **Deployment workflow.** README documents Vercel serverless deployment while `npm run deploy` publishes a static build through GitHub Pages. The frontend supports an explicit API base URL, so a separate API host is possible. Document the intended arrangement before removing either workflow.
8. **Build workaround.** The Firebase sourcemap script is executed by package lifecycle commands and refers to a particular hashed map. A clean installation and a build without the workaround are needed to prove it can be removed.
9. **Metadata/content.** The public PNGs are custom branding and should remain. HTML title/description/language are template leftovers. FAQ's 2025 deadline needs a content decision; this code audit did not verify external links or current availability.

## Suggested implementation order

1. **Delete confirmed leftovers with minimal movement.** Remove unreferenced template files, inactive metrics, unused time/timetable exports, obsolete CSS/commented JSX, and unused direct dependencies. Update package metadata/lockfile through npm. Run tests/build.
2. **Remove unused execution paths.** Convert event filtering to a pure function, remove disabled selector state/props, remove unused date outputs, and keep only the rendered group-set layout. Preserve active language-group filtering and saved user data. Add focused regression coverage for filtering and the surviving group-set controls.
3. **Unify browser integrations.** Consolidate Firebase configuration and update all imports/mocks. If sharing auth lifecycle through a provider, validate auth/settings transitions as an explicit state refactor.
4. **Extract meaningful modules.** Move private-plan state/cache/mapping and navigation/merging out of `App`. Separate timetable reads/normalization/cache and group-set management. Add tests for data/state boundaries before changing behavior inside them.
5. **Move into the feature folders.** Update imports, Jest mocks, SVG references, and documentation together. Preserve entry points, public asset references, and server endpoint paths. Use lowercase folder names and PascalCase component names consistently.
6. **Deduplicate backend helpers.** Extract the repeated HTTP/user functions while preserving each endpoint's status codes, ownership checks, read/write behavior, and response shape. Run backend behavior checks, not only the browser suite.
7. **Finish configuration and documentation.** Complete `.env.example`, replace template metadata and README content, update `docs/events.md`, and document the resulting architecture. Resolve the conditional data/deployment/workaround items from the preceding section.

Keep removal, file movement, and behavior fixes distinguishable in reviewable changes. Do not combine this work with a framework migration, wholesale formatting, or a new state-management dependency.

## Validation and completion criteria

Baseline verification performed during this audit:

- `npm.cmd test -- --watchAll=false --runInBand` with `CI=true`: **3 suites, 12 tests passed**.
- `npm.cmd run build`: **compiled successfully**. The command ran the existing Firebase map prebuild hook and regenerated ignored `build/` output.
- `npm.cmd ls --depth=0`: direct dependency tree resolved without reported missing/extraneous dependencies.
- Checked the browser import graph, named exports, JSX consumers, state/prop forwarding, configured scripts, public references, and the installed build configuration. Static-tool candidates were manually checked; internal function uses and convention-based entry points were not treated as dead code.
- The build emitted notices about old browser compatibility datasets and an `fs.F_OK` deprecation. These did not fail the build and are not evidence of a folder-structure defect.

The existing tests cover navigation/refresh but do not establish the correctness of auth, settings synchronization, remote APIs, normalization, export contents, collision layout, or private-plan optimistic recovery. No live Firebase, Supabase, or n8n operations were invoked by this audit; the browser tests use mocks. No deployment was performed.

For the actual cleanup to be considered complete:

- Every retained first-party file has a clear runtime, test, build, deployment, documentation, or data purpose.
- There is one browser Firebase setup, with browser and Admin clients remaining separate.
- Calendar/ICS selection uses one maintained filtering implementation; the unused filtered-result state/cache is gone.
- Disabled selector plumbing, unused group-set layout, unused exports, template assets, and verified obsolete CSS are removed.
- App composition, navigation, private-plan state, timetable data, and group-set logic have explicit owners.
- No import, test mock, asset reference, or documentation link points to a removed/moved path unintentionally.
- Existing behavior tests/build pass, with focused coverage for changed state/data boundaries and backend helper extraction.
- Manual smoke checks cover day/week views, group sets and external groups, login/logout/preferences, refresh failures, both exports, and successful/failed private-plan mutations.
- CSV retention, deployment commands, and the sourcemap workaround have an explicit recorded disposition; none are deleted on the basis of missing React imports alone.

This report is the review artifact for that work. It does not claim the proposed cleanup has already been implemented.
