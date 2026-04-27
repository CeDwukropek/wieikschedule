# Getting Started with Create React App

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

## n8n Chatbot Setup

AI chat can be enabled per branch/environment with a feature flag:

```bash
REACT_APP_ENABLE_AI_CHAT=true
```

Set it to `false` (or omit it) on Beta/public to keep unified navigation without AI chat integration in the UI.

Schedule data is now loaded from Supabase. Configure frontend read access with:

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-public-anon-key
```

## Firebase Auth (Google)

Google login uses Firebase Auth redirect flow (`signInWithRedirect`), so credentials are handled by Google/Firebase and are not processed by this app backend.

Add these variables to `.env.local` (or Vercel Environment Variables):

```bash
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

Required keys for login are:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_APP_ID`

### Vercel setup

1. Open project in Vercel.
2. Go to `Settings` -> `Environment Variables`.
3. Add all `REACT_APP_FIREBASE_*` variables.
4. Scope them to the environment/branch you want (for example: `Preview` + `alpha`).
5. Redeploy that branch.

Important: in CRA, `REACT_APP_*` values are bundled into client JS and can be visible in the browser. This is expected for Firebase Web config and does not grant admin access by itself. Security must be enforced with Firebase Auth settings, authorized domains, and Firestore/Storage security rules.

## System map (what is where and why)

Frontend (React):

- App logic and schedule merge: [src/App.js](src/App.js)
- Views: [src/View/WeekView.js](src/View/WeekView.js), [src/View/DayView.js](src/View/DayView.js)
- Event tile UI: [src/EventCard.js](src/EventCard.js)
- Chat UI: [src/chatbot/ChatPopup.js](src/chatbot/ChatPopup.js), [src/Menu/FloatingChatPanel.js](src/Menu/FloatingChatPanel.js)
- Chat integration + parsing: [src/chatbot/useChatbot.js](src/chatbot/useChatbot.js), [src/chatbot/n8nClient.js](src/chatbot/n8nClient.js)
- API client (frontend -> backend): [src/myPlanApi.js](src/myPlanApi.js)

Backend (Vercel serverless):

- Add event: [api/my-plan/add-event.js](api/my-plan/add-event.js)
- Remove event: [api/my-plan/remove-event.js](api/my-plan/remove-event.js)
- List added events: [api/my-plan/added-events.js](api/my-plan/added-events.js)
- Firebase Admin auth: [api/\_lib/firebaseAdmin.js](api/_lib/firebaseAdmin.js)
- Request auth helper: [api/\_lib/requestAuth.js](api/_lib/requestAuth.js)
- Supabase Admin client: [api/\_lib/supabaseAdmin.js](api/_lib/supabaseAdmin.js)

Config:

- Local env: [.env.local](.env.local)
- Build and scripts: [package.json](package.json)

Flow overview:

1. Frontend calls `/api/my-plan/*` with `Authorization: Bearer <Firebase ID token>`.
2. Backend verifies token via Firebase Admin.
3. Backend reads/writes Supabase using the service role key.
4. Frontend merges base schedule with added events for display.

## Deploy to Vercel (end-to-end)

1. Connect repo in Vercel (New Project -> Import from GitHub).
2. Set environment variables in Vercel (Project -> Settings -> Environment Variables).
3. Deploy the branch.

Environment variables to add in Vercel:

Frontend (build/runtime):

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_N8N_CHAT_WEBHOOK`
- `REACT_APP_API_BASE_URL`

Server-only (runtime for serverless):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Notes:

- On Vercel, set `REACT_APP_API_BASE_URL` to empty or to your Vercel domain so `/api` is same-origin.
- `FIREBASE_PRIVATE_KEY` must keep `\n` line breaks.
- `REACT_APP_*` values are bundled into client JS, so only put public config there.

## Request flow diagram (high level)

```
Browser (React)
  │
  │  1) POST /api/my-plan/add-event (Bearer Firebase ID token)
  ▼
Vercel Serverless
  │  2) verifyIdToken (Firebase Admin)
  │  3) read/write Supabase (service role)
  ▼
Supabase (Postgres)
  ▲
  │  4) response back to client
  └────────────────────────────────────────────
```

## Go-live checklist (Vercel)

Pre-deploy:

- [ ] Local build passes: `npm run build`
- [ ] API runs locally: `npx vercel dev --listen 3001`
- [ ] Login works in UI (token present in request headers)
- [ ] Add/remove event flow returns 200 (no 401/405)

Vercel config:

- [ ] Project imported from GitHub
- [ ] All env vars set for Preview + Production
- [ ] `REACT_APP_API_BASE_URL` empty or set to Vercel domain
- [ ] `FIREBASE_PRIVATE_KEY` stored with `\n` line breaks

Post-deploy:

- [ ] Login works on Vercel domain
- [ ] `/api/my-plan/added-events` returns 200 for logged-in user
- [ ] Add/remove event works end-to-end
- [ ] Chat webhook reachable (if AI chat enabled)

## Firestore rules for user settings

This app stores logged-in user settings in one document per user:

- Collection: `userSettings`
- Document ID: `auth.uid`

A starter ruleset is included in [firestore.rules](firestore.rules).

What these rules enforce:

1. Only authenticated users can access settings documents.
2. A user can only read/write their own document (`request.auth.uid == userId`).
3. Only `settings` and `updatedAt` fields are allowed at top level.
4. `updatedAt` must be server time (`request.time`).

### How to publish rules (Firebase Console)

1. Open Firebase Console.
2. Go to Firestore Database -> Rules.
3. Replace current rules with contents of [firestore.rules](firestore.rules).
4. Click Publish.

### Quick verification

1. Log in with User A and change any app setting.
2. In Firestore, confirm write appears in `userSettings/{uid-of-user-a}`.
3. Log in with User B and confirm User B does not see User A settings.

4. Create `.env.local` in the project root.
5. Add your n8n webhook URL:

```bash
REACT_APP_N8N_CHAT_WEBHOOK=https://your-n8n-instance/webhook/your-chat-endpoint
```

3. Restart the dev server after changing env vars.

The chat widget sends payloads in this shape:

```json
{
  "message": "When is my next lab?",
  "context": {
    "scheduleName": "EiAs2",
    "sessionId": "5f9781e4-00fb-4da3-96a0-8f4e87d3cc24",
    "selectedGroups": {
      "W": "W1",
      "C": "C2",
      "L": "L1",
      "P": "P1",
      "Lek": "LekN"
    }
  },
  "metadata": {
    "source": "wieikschedule-web",
    "timestamp": "2026-03-25T10:00:00.000Z"
  }
}
```

Expected response can be either plain text or JSON with one of these string fields:
`reply`, `response`, `answer`, `output`, `message`, `text`.

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
