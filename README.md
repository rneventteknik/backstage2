# Backstage2

Backstage2 is a web app that is created by RN, for RN, and is used to keep track of all of our events. It is hosted in Heroku.

## Tech Stack

## Contributing

### Preparing the Dev Environment

Our package manager of choice is [`yarn`](https://yarnpkg.com/). After cloning the repo with `git clone`, run `yarn install` to install all the dependencies.

`yarn migrate` will run the latest Knex migration which will populate your database with the latest schema.

`yarn seed` will seed your database with some mock data.

`yarn reset-sqlite` will remove the existing sqlite database, create a new one, and seed it with data.

`yarn dev` will start a local development server.

`yarn tc` will type-check all of the code using _Typescript_.

`yarn lint` will run _eslint_ on all relevant files and fix any problems it knows how to fix automatically.

### Environment Variables

A few environment variables are needed to get this app to run. To configure these, the file `.env.local` can be added to this folder. It should contain the following:

```
SECRET_COOKIE_PASSWORD={session cookie secret; >32 chars (mandatory, used to encrypt the session)}

DATABASE_URL=postgres://{user}:{password}@{hostname}:{port}/{database-name} (optional, only needed when using PostgreSQL)
DB_SSL={true or false} (optional, only needed when using PostgreSQL)

MAX_SESSION_LENGTH={Maximum number of milliseconds a user is allowed to stay logged in.} (optional, defaults to forever if not set)

CALENDAR_API_KEY={Google Calender API Key, with read-access to calendars}
CALENDAR_ID={Google Calender ID to fetch events from}

DRIVE_CREDENTIALS={Base64 encoded Google Drive Service Account credentials in JSON format. The account should have write-access to DRIVE_ROOT_FOLDER}
DRIVE_ROOT_FOLDER_ID={ID of folder which contains booking folders}

SLACK_BOT_TOKEN={API token for slack bot, with chat:write access}
SLACK_CHANNEL_ID={Slack channel to post message to}
APPLICATION_BASE_URL={Base URL of application when generating links, for example http://localhost:3000}

API_KEYS={JSON list of API keys, for example [{"key": "XXX", "name": "slackbot"}]} (optional, only needed when using backstage2 as an API from an external service)

NEXT_PUBLIC_MQTT_BROKER_URL={wss://hostname:port}
MQTT_BROKER_USERNAME={Username to the mqtt broker}
MQTT_BROKER_PASSWORD={Passowrd to the mqtt broker}
```

### Version Control

#### Branching Model

Most development should happen on branches based on `main`.

We use prefixes to indicate what kind of changes every branch contains. The prefixes in use are:

-   `feature/` for regular feature branches
-   `bugfix/` for bugfix branches
-   and when needed also `hotfix/` which is branches fixing urgent issues in production.

The branch name after the prefix should be _descriptive_, _short_ and in `kebab-case`.

#### Pull Request Review

A pull request review should go through the following:

-   The code should follow existing design patterns.
-   The code should optimally be self documenting. In cases where it's not, it should have descriptive comments.
-   Think through any corner cases that might exist and check that they are handled.
-   Check that there are no obvious security holes.

#### Merge Strategy

We try to avoid merge commits and instead use squashing as our preferred merging strategy. Other strategies can be used if it's motivated.
