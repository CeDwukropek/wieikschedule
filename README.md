# Getting Started with Create React App

## Firebase timetable integration

The app now supports loading timetables from Firestore (with local static fallback).

### 1) Configure environment variables

Create `.env.local` in the project root:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_SCHEDULE_INDEX_COLLECTION=schedules
REACT_APP_FIREBASE_SCHEDULE_COLLECTIONS=AwP4.0s1,AwP4.0s2
REACT_APP_FIREBASE_FACULTY_EVENTS_COLLECTION=faculty
REACT_APP_FIREBASE_FACULTY_METADATA_COLLECTION=faculty_metadata
```

For Vercel with Create React App (`react-scripts`), set `REACT_APP_*` variables in Project Settings and redeploy.

`REACT_APP_FIREBASE_SCHEDULE_INDEX_COLLECTION` is a metadata collection used to auto-discover schedules.
`REACT_APP_FIREBASE_SCHEDULE_COLLECTIONS` stays as fallback (comma-separated list).
`REACT_APP_FIREBASE_FACULTY_EVENTS_COLLECTION` is a fallback single collection with mixed faculties.
`REACT_APP_FIREBASE_FACULTY_METADATA_COLLECTION` is used to populate schedule selector entries in faculty-split mode.

If Firebase config is missing, the app automatically uses local files from `src/timetables`.

### 2) Firestore shape (one collection = one schedule)

#### 2a) Metadata collection (recommended)

Collection: `schedules` (or value from `REACT_APP_FIREBASE_SCHEDULE_INDEX_COLLECTION`)

Each document should include at least:

```json
{
  "collectionId": "AwP4.0s1",
  "name": "Automatyka i Robotyka P4 s1"
}
```

The app reads this collection and shows these schedules in the selector.

#### 2b) Event collection (per schedule)

Collection example: `AwP4.0s1`

**Recurring event format (recommended):**

```json
{
  "startDate": "2026-02-24T00:00:00.000Z",
  "endDate": "2026-06-16T00:00:00.000Z",
  "startTime": "14:30",
  "durationMin": 90,
  "intervalWeeks": 2,
  "excludedDates": "[]",
  "overrides": "{\"2026-03-10\":{\"durationMin\":45}}",
  "faculty": "IwIKs4",
  "group": "P4",
  "room": "201",
  "subject": "Programowanie w języku JAVA",
  "teacher": "dr inż. S. Bąk",
  "type": "Laboratorium"
}
```

Fields:

- `startDate` / `endDate`: Firestore timestamps defining the recurrence range
- `startTime`: "HH:MM" string (e.g., "14:30")
- `durationMin`: duration in minutes
- `intervalWeeks`: 1 = weekly, 2 = bi-weekly, etc.
- `excludedDates`: JSON array of dates to skip (e.g., `["2026-03-17"]`)
- `overrides`: JSON object with date-specific changes (e.g., `{"2026-03-10":{"durationMin":45,"_add":false}}`)
- `group`: group identifier (e.g., "P4", "Lek1"). "W" is filtered out from group inputs.

**Legacy single-event format (still supported):**

```json
{
  "duration": 90,
  "faculty": "AwP4.0s1",
  "group": "Lek1",
  "isoStart": "2026-06-11T10:45:00.000Z",
  "room": "139SJO",
  "subject": "Język angielski",
  "teacher": "mgr J. Firganek",
  "type": "Laboratorium"
}
```

#### 2c) Single collection with mixed faculties (new fallback)

Collection: `faculty` (or value from `REACT_APP_FIREBASE_FACULTY_EVENTS_COLLECTION`)

Each document is one event and must include `faculty`. The app auto-splits this one collection into schedules by faculty.

```json
{
  "date": "2026-02-27T00:00:00.000Z",
  "startTime": "08:15",
  "durationMin": 135,
  "faculty": "EiAs2",
  "group": "L1 / L2 / L3",
  "instructor": "K. Suchanek (op), J. Kurzyk, W. Chajec",
  "room": "F115",
  "status": "aktywne",
  "subject": "Fizyka",
  "type": "laboratoria"
}
```

Notes for this format:

- `startTime` + `durationMin` are used to compute `start` / `end` for rendering.
- `instructor` is accepted as alias for `teacher`.
- `group` can be a single value or combined values like `L1 / L2 / L3`.

#### 2d) Faculty metadata collection (optional, recommended with 2c)

Collection: `faculty_metadata` (or value from `REACT_APP_FIREBASE_FACULTY_METADATA_COLLECTION`)

Each document should include at least `faculty`:

```json
{
  "faculty": "EiAs2",
  "groups": ["L1", "L2", "L3"],
  "subjects": ["Fizyka"],
  "updatedAt": "2026-02-26T09:30:00.000Z"
}
```

The app uses this collection to render `<select>` schedule options faster, without deriving faculties from all event documents first.

Notes:

- `isoStart` + `duration` are converted to `start` / `end` automatically.
- Schedule discovery order: `faculty_metadata` (if non-empty, faculty mode is preferred) -> metadata collection -> env collection list -> single `faculty` collection -> legacy `timetables`.
- Weeks are derived from real dates, so navigation works from first week to last week.
- Mobile week mode has 3 controls: previous week, current week, next week.
- Legacy parity (`weeks: "odd" | "even"`) still works for static data.
- ICS export uses one-time events for date-based data and recurring events only for legacy parity data.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
