# Backstage2 #

## Contributing ##
### Version Control ###
#### Branching model ####
We use the branching model [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). This means that we have a production branch (does not exist yet) and separate development branch called `dev`.

Our branch naming convention is based on this model and we use prefixes to indicate what type every branch has. The prefixes in use are:
- `feature/` for regular feature branches
- `bugfix/` for bugfix branches
- and when needed also `hotfix/` which is branches fixing urgent issues in production.

#### Merge strategy ####
We try to avoid merge commits and instead use squashing as our preferred merging strategy.

### Database config ###
The database config reads from environment variables.
To configure these, the file `.env.local` can be added to this folder with the following content:

```
DB_HOST={database host name}
DB_USER={databse user name}
DB_PASS={database password}
DB_NAME={database name}
```
