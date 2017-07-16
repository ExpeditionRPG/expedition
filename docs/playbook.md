# Expedition Production Playbook

If something's amiss in production, look at this page for debugging tools and tricks.

## DO THIS FIRST

Check [prod dyno metrics](https://dashboard.heroku.com/apps/expedition-quest-creator/metrics/web) for failures.

If you see errors at the serving level (e.g. not a particular part of the quest creator or app), first check that heroku does not have an active incident:

http://status.heroku.com/

Check [newrelic monitoring](https://rpm.newrelic.com/accounts/988111/applications/65715175) for abnormal traffic patterns that indicate problems with specific requests or users.

## Actions

### Stop all payments

In an emergency (runaway payments for instance), stop all new payment transactions in prod:

```shell
heroku config:set ENABLE_PAYMENT=false -a expedition-quest-creator
```

### Maintenance Page (for extended outages)

In a hard outage where
- the quest creator site is not visible at all
- users cannot interact with the SQL database

OR for scheduled downtime, put the site in [maintenance mode](https://devcenter.heroku.com/articles/maintenance-mode):

```shell
heroku maintenance:on -a expedition-quest-creator
```

After the outage is resolved, turn off maintenance mode:

```shell
heroku maintenance:off -a expedition-quest-creator
```

### Viewing logs

```shell
heroku logs -a expedition-quest-creator
```

### Deploy to prod

```shell
git checkout ${BRANCH_TO_DEPLOY}
git push heroku ${BRANCH_TO_DEPLOY}:master
```

If you want to be especially cautious, you can even set up your default heroku remote to point to dev, and create an explicit `prod` remote for pushing to prod:
```
heroku git:remote -a expedition-quest-creator-dev -r heroku
heroku git:remote -a expedition-quest-creator -r prod
```

### Rollback

Get prod release list (versions are on the left column):

```shell
heroku releases -a expedition-quest-creator
```

Rollback prod to version:

```shell
heroku rollback v### -a expedition-quest-creator
```

For dev, replace `expedition-quest-creator` with `expedition-quest-creator-dev`.

### DB Backups

Listing backup schedule:

```shell
heroku pg:backups:schedules -a expedition-quest-creator
```

Listing backups:

```shell
heroku pg:backups --app expedition-quest-creator
```

Downloading backups:

```shell
heroku pg:backups:url ${BACKUP} -a expedition-quest-creator
```

Restoring backups:
```shell
heroku pg:backups:restore ${BACKUP} DATABASE_URL -a expedition-quest-creator
```

### Quest DB

Connecting to the DB:

```shell
heroku pg:psql -a expedition-quest-creator
```

## Monthly Actions

- Check prod [datastore](https://data.heroku.com/) is below 80% of row quota and has recent backups.
- Backup [prod heroku config variables](https://dashboard.heroku.com/apps/expedition-quest-creator/settings) to lastpass.
- Test manual deployment via `git push heroku master`, and rollback with `heroku rollback` in dev environment.
