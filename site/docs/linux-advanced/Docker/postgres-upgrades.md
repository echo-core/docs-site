---
sidebar_position: 1
---
# Upgrading Postgres SQL in a Docker Environment

At the time of writing, this will upgrade `postgres` `16` to `17`. This guide will walk through:

* Creating a backup.
* Installing the new version of `postgres`.
* Importing the backup.
* Verifying the upgrade was a success.

_This guide assumes you already have an existing image configured and working._

:::warning
Make sure to keep backups, because you never know...
:::

## Backup databases

:::danger
Take care to double check before editing your `yaml` files and verify the commands are correct for your environment before executing these. Needless to say your environment could suffer greatly if the process isn't handled with care.
:::

1. Create a directory to mount to dump the backups to.

```bash
mkdir ${DB_PATH}/pg-bu
```
2. Modify your existing image and mount the directory.

```yaml
  postgres:
    image: postgres:16
    container_name: postgres
    restart: unless-stopped
    ports:
      - 5432:5432
    volumes:
      - ${DB_PATH}/pg16:/var/lib/postgresql/data
      - ${DB_PATH}/pg-bu:/pg-bu
    healthcheck:
      test:
        - CMD-SHELL
        - pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 5s
    env_file:
      - .env
```
3. Create the backup.

_Modify `$POSTGRES_USER` to your `postgres` admin user._

```bash
docker exec -it postgres /bin/bash -c 'pg_dumpall -U $POSTGRES_USER > /pg-bu/all-dbs.sql'
```

4. Stop the old container.

```bash
docker compose down
```

## Upgrade `postgres` to `17`

1. Create new server directory

```bash
mkdir ${DB_PATH}/pg17
```
2. Modify your docker compose file for the new version.

_Note: the tag has changed to `17` and the volume have changed to `pg17`._

```yaml
  postgres:
    image: postgres:17
    container_name: postgres
    restart: unless-stopped
    ports:
      - 5432:5432
    volumes:
      - ${DB_PATH}/pg17:/var/lib/postgresql/data
      - ${DB_PATH}/pg-bu:/pg-bu
    healthcheck:
      test:
        - CMD-SHELL
        - pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 5s
    env_file:
      - .env
```
3. Start the new container.

```bash
docker compose pull && docker compose up -d
```

## Import databases

1. Verify database backup is accessible.

```bash
docker exec -it postgres /bin/ls /pg-bu
```

2. Import backups.

_Modify `$POSTGRES_DB` to your `postgres` database and set `$POSTGRES_USER` to your `postgres` admin user._

```bash
docker exec -it postgres /bin/bash -c 'psql -d $POSTGRES_DB -U $POSTGRES_USER < /pg-bu/all-dbs.sql'
```

_At this point your database server should be working and accepting connections to your existing databases._

## Verify databases

_Modify $POSTGRES_USER to your postgres admin user._

```bash
docker exec -it postgres /bin/bash -c 'psql -U $POSTGRES_USER -l'
```

You should get output similar to below verifying the databases exist:
```
                                                     List of databases
    Name     |    Owner    | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules | Access privileges
-------------+-------------+----------+-----------------+------------+------------+--------+-----------+-------------------
 authentik   | authentik   | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 immich      | immich      | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 joplin      | joplin      | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 mealie      | mealie      | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 npm         | npm         | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 postgres    | admin       | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 semaphore   | semaphore   | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 template0   | admin       | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | =c/admin         +
             |             |          |                 |            |            |        |           | admin=CTc/admin
 template1   | admin       | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | =c/admin         +
             |             |          |                 |            |            |        |           | admin=CTc/admin
 vaultwarden | vaultwarden | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
(10 rows)
```

## References
* [Upgrade PostgresSQL from 16 to 17 in Docker](https://blog.oxyconit.com/how-to-update-postgres-16-to-17-in-docker)
