# Expedition Production Playbook

If something's amiss in production, look at this page for debugging tools and tricks.

[TOC]

## DO THIS FIRST

Check [prod dyno metrics](https://dashboard.heroku.com/apps/expedition-quest-creator/metrics/web) for failures.

If you see errors at the serving level (e.g. not a particular part of the quest creator or app), first check that heroku does not have an active incident:

http://status.heroku.com/

## Actions

### Stop all payments

In an emergency (runaway payments for instance), stop all new payment transactions in prod:

```shell
heroku config:set ENABLE_PAYMENT=false -a expedition-quest-creator
```

### Extended outages

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
git checkout ${BRANCH_TO_PUSH_TO_PROD}
git push heroku prod
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
