# Goal Reminder Database

These steps will setup/reset the production database:

1. Copy ```./sql/db-reset-dev.sql``` to ```./sql/db-reset-prod.sql``` and modify it according to the production Postgres service
2. Run ```psql``` with super user credentials and feed it the ```db-reset-prod.sql``` file. For example: ```sudo -u postgres psql -d postgres -a -f sql/db-reset-prod.sql```