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

`yarn test` will run all cypress tests. This requires a server to be running at `localhost:3000` with a fresh seed. Make sure to run `yarn seed` before.

### Environment Variables

A few environment variables are needed to get this app to run. To configure these, the file `.env.local` can be added to this folder. It should contain the following:

```
SECRET_COOKIE_PASSWORD={session cookie secret; >32 chars (mandatory, used to encrypt the session)}

DB_HOST={database host name (optional, only needed when using PostgreSQL)}
DB_USER={databse user name (optional, only needed when using PostgreSQL)}
DB_PASS={database password (optional, only needed when using PostgreSQL)}
DB_NAME={database name (optional, only needed when using PostgreSQL)}
DB_SSL={true or false (optional, only needed when using PostgreSQL)}

MAX_SESSION_LENGTH={Maximum number of milliseconds a user is allowed to stay logged in. (optional, defaults to forever if not set)}

CALENDAR_API_KEY={Google Calender API Key, with read-access to calendars}
CALENDAR_ID={Google Calender ID to fetch events from}

SLACK_BOT_TOKEN={API token for slack bot, with chat:write access}
SLACK_CHANNEL_ID={Slack channel to post message to}
APPLICATION_BASE_URL={Base URL of application when generating links, for example http://localhost:3000}
```

### Version Control

#### Branching Model

We use the branching model [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). This means that we have a production branch (does not exist yet) and separate development branch called `dev`.

Our branch naming convention is based on this model and we use prefixes to indicate what type every branch has. The prefixes in use are:

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
