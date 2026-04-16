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
