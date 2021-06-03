# Backstage2 #
Backstage2 is a web app that is created by RN, for RN, and is used to keep track of all of our events.

## Tech Stack ##

## Contributing ##
### Preparing the Dev Environment ###
Our package manager of choice is [`yarn`](https://yarnpkg.com/). After cloning the repo with `git clone`, run `yarn install` to install all the dependencies.

`yarn migrate` will run the latest Knex migration which will populate your database with the latest schema.

`yarn seed` will seed your database with some mock data.

`yarn dev` will start a local development server.

`yarn type-check` will type-check all of the code using *Typescript*.

`yarn lint` will run *eslint* on all relevant files and fix any problems it knows how to fix automatically.

### Environment Variables ###
A few environment variables are needed to get this app to run. To configure these, the file `.env.local` can be added to this folder. It should contain the following:

```
DB_HOST={database host name}
DB_USER={databse user name}
DB_PASS={database password}
DB_NAME={database name}
DB_SSL={true or false}

SECRET_COOKIE_PASSWORD={session cookie secret; >32 chars}
```

### Version Control ###
#### Branching Model ####
We use the branching model [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). This means that we have a production branch (does not exist yet) and separate development branch called `dev`.

Our branch naming convention is based on this model and we use prefixes to indicate what type every branch has. The prefixes in use are:

- `feature/` for regular feature branches
- `bugfix/` for bugfix branches
- and when needed also `hotfix/` which is branches fixing urgent issues in production.

The branch name after the prefix should be *descriptive*, *short* and in `kebab-case`.

#### Pull Request Review ####
A pull request review should go through the following:

- The code should follow existing design patterns.
- The code should optimally be self documenting. In cases where it's not, it should have descriptive comments.
- Think through any corner cases that might exist and check that they are handled.
- Check that there are no obvious security holes.

#### Merge Strategy ####
We try to avoid merge commits and instead use squashing as our preferred merging strategy. Other strategies can be used if it's motivated.
