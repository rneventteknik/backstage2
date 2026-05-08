# Backstage2

Backstage2 is a web app that is created by RN, for RN, and is used to keep track of all of our events. It is hosted in Heroku.

## Quick Start

```bash
git clone <repo>
cd backstage2
npm install
echo 'SECRET_COOKIE_PASSWORD=changeme-changeme-changeme-changeme' > .env.local  # any string >32 chars
npm run reset-sqlite
npm run dev
```

Open http://localhost:3000 and log in with `albert` / `dmx`.

## Tech Stack

-   **[Next.js](https://nextjs.org/)** — React framework (frontend + API routes)
-   **[React](https://react.dev/) + [React Bootstrap](https://react-bootstrap.github.io/)** — UI
-   **[Knex](https://knexjs.org/) + [Objection.js](https://vincit.github.io/objection.js/)** — query builder and ORM
-   **[SQLite](https://www.sqlite.org/) / [PostgreSQL](https://www.postgresql.org/)** — database (SQLite for local dev, PostgreSQL in production)
-   **[TypeScript](https://www.typescriptlang.org/)** — language
-   **[iron-session](https://github.com/vvo/iron-session)** — session management

### npm Scripts

| Command               | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `npm run dev`         | Start local development server                           |
| `npm run migrate`     | Run latest Knex migrations                               |
| `npm run seed`        | Seed database with mock data                             |
| `npm run reset-sqlite`| Wipe SQLite database, migrate, and seed                  |
| `npm run tc`          | Type-check with TypeScript                               |
| `npm run lint`        | Run ESLint and auto-fix                                  |

### Seed Users

After running `npm run seed`, the following users are available for local development (see [`knex/seeds/mock.js`](knex/seeds/mock.js) for the up-to-date list):

| Username | Password | Role     |
| -------- | -------- | -------- |
| albert   | dmx      | Admin    |
| markus   | xlr      | User     |
| gabriel  | hog      | Readonly |

### Database

The app supports two database backends:

-   **SQLite** (default for local dev): No configuration needed. A `dev.sqlite3` file is created automatically. Use `npm run reset-sqlite` to wipe and re-seed it.
-   **PostgreSQL**: Set the `DATABASE_URL` environment variable in `.env.local`. The app will automatically use PostgreSQL when this variable is present.

### Environment Variables

A few environment variables are needed to get this app to run. To configure these, the file `.env.local` can be added to this folder. It should contain the following:

```
SECRET_COOKIE_PASSWORD={session cookie secret; >32 chars (mandatory, used to encrypt the session)}

DATABASE_URL=postgres://{user}:{password}@{hostname}:{port}/{database-name} (optional, only needed when using PostgreSQL)
DB_SSL={true or false} (optional, only needed when using PostgreSQL)

MAX_SESSION_LENGTH={Maximum number of milliseconds a user is allowed to stay logged in.} (optional, defaults to forever if not set)

CALENDAR_API_KEY={Google Calendar API Key, with read-access to calendars}
CALENDAR_ID={Google Calendar ID to fetch events from}

DRIVE_CREDENTIALS={Base64 encoded Google Drive Service Account credentials in JSON format. The account should have write-access to both root folders}
DRIVE_BOOKING_ROOT_FOLDER_ID={ID of folder which contains booking folders}
DRIVE_EQUIPMENT_ROOT_FOLDER_ID={ID of folder which contains equipment folders}

NEXT_PUBLIC_BASE_URL={Base URL of the application, used for OAuth redirect URIs, for example http://localhost:3000}

GMAIL_CLIENT_ID={Google OAuth2 Client ID for Gmail API}
GMAIL_CLIENT_SECRET={Google OAuth2 Client Secret for Gmail API}

SLACK_BOT_TOKEN={Slack bot token with chat:write and im:write scopes}
SLACK_CHANNEL_ID={ID of the Slack channel to post booking notifications to}
APPLICATION_BASE_URL={Base URL of the application when generating links, for example http://localhost:3000}

NEXT_PUBLIC_MQTT_BROKER_URL={WebSocket URL of MQTT broker, e.g. wss://hostname:port}
MQTT_BROKER_USERNAME={MQTT broker username}
MQTT_BROKER_PASSWORD={MQTT broker password}

NEXT_PUBLIC_POSTHOG_KEY={PostHog project API key for product analytics}

API_KEYS={JSON list of API keys, for example [{"key": "XXX", "name": "slackbot"}]} (optional, only needed when using backstage2 as an API from an external service)
```

## Integrations Setup

### Google Calendar Setup

1. Create a [Google Cloud Project](https://console.cloud.google.com/) and enable the [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
2. Create an API key (no OAuth needed — read-only access is sufficient)
3. Share the calendar with the API key or make it public
4. Find the Calendar ID under calendar settings in [Google Calendar](https://calendar.google.com/)
5. Add to `.env.local`:

```
CALENDAR_API_KEY=AIza...
CALENDAR_ID=abc123@group.calendar.google.com
```

### Google Drive Setup

Drive integration uses a Service Account so it can manage folders without user interaction.

1. Create a [Google Cloud Project](https://console.cloud.google.com/) and enable the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
2. Create a Service Account and download its JSON credentials file
3. Share the root Drive folders with the service account's email address (give it Editor access)
4. Base64-encode the credentials file: `base64 -w 0 credentials.json`
5. Add to `.env.local`:

```
DRIVE_CREDENTIALS={base64-encoded credentials JSON}
DRIVE_BOOKING_ROOT_FOLDER_ID={ID of the folder that will contain booking subfolders}
DRIVE_EQUIPMENT_ROOT_FOLDER_ID={ID of the folder that will contain equipment subfolders}
```

The folder ID is the last part of the folder's URL in [Google Drive](https://drive.google.com/): `https://drive.google.com/drive/folders/{ID}`.

### Gmail Setup

Gmail integration uses OAuth2 for read-only access to a mailbox.

1. Create a [Google Cloud Project](https://console.cloud.google.com/) and enable the [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
2. Create OAuth2 credentials (Web application type)
3. Add `{NEXT_PUBLIC_BASE_URL}/api/email/authenticate/callback` as an authorized redirect URI
4. Add to `.env.local`:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GMAIL_CLIENT_ID=1095269337813-xxxxxxxxxxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxx
```

5. Start the dev server and navigate to `/api/email/authenticate` while logged in as an admin
6. Complete the Google OAuth flow — the refresh token is saved to the database automatically

### Slack Setup

Slack is used to send notifications about bookings to a channel and to open DMs with booking workers.

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps) and install it to your workspace
2. Add the `chat:write` and `im:write` bot token scopes
3. Copy the Bot User OAuth Token
4. Add to `.env.local`:

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID={ID of the channel to post to}
APPLICATION_BASE_URL=http://localhost:3000
```

The channel ID is found by right-clicking a channel in Slack and selecting _View channel details_.

### MQTT Setup

MQTT is used to display real-time door and key status. Any MQTT broker with WebSocket support will work.

1. Set up an MQTT broker with WebSocket support (e.g. [Mosquitto](https://mosquitto.org/) with the `websockets` listener enabled)
2. Configure topics for door, key, and alarm status in the app settings
3. Add to `.env.local`:

```
NEXT_PUBLIC_MQTT_BROKER_URL=wss://hostname:port
MQTT_BROKER_USERNAME={broker username}
MQTT_BROKER_PASSWORD={broker password}
```

### PostHog Setup

PostHog is used for product analytics. The app uses the EU-hosted PostHog instance.

1. Create a project at [eu.posthog.com](https://eu.posthog.com)
2. Copy the project API key
3. Add to `.env.local`:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

Analytics are silently skipped if the key is not set.

## Version Control

### Branching Model

Most development should happen on branches based on `main`.

We use prefixes to indicate what kind of changes every branch contains. The prefixes in use are:

-   `feature/` for feature branches
-   `bugfix/` for bug fixes

The branch name after the prefix should be _descriptive_, _short_ and in `kebab-case`.

### Commit and PR Naming

Commits and PR titles use a prefix to indicate the type of change, followed by a short description:

-   `Feature: <description>` for new features
-   `Bugfix: <description>` for bug fixes 
-   Other types of commits are not regulated, be descriptive

### Pull Request Review

A pull request review should go through the following:

-   The code should follow existing design patterns.
-   The code should optimally be self documenting. In cases where it's not, it should have descriptive comments.
-   Think through any corner cases that might exist and check that they are handled.
-   Check that there are no obvious security holes.

### Merge Strategy

We try to avoid merge commits and instead use squashing as our preferred merging strategy. Other strategies can be used if it's motivated.
