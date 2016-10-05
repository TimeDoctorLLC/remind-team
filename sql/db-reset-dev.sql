DROP DATABASE IF EXISTS goalreminder_dev;

DROP ROLE IF EXISTS grdev_role;

CREATE ROLE grdev_role LOGIN PASSWORD 'ht9PqWxKv5emthmubEErpJSg';

CREATE DATABASE goalreminder_dev WITH OWNER grdev_role 
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       CONNECTION LIMIT = -1
	TEMPLATE = template0;
    
\c goalreminder_dev

\i sql/database.sql

GRANT ALL PRIVILEGES ON DATABASE goalreminder_dev TO grdev_role;

-- FIXME configure it to work without superuser permissions!
ALTER USER grdev_role WITH SUPERUSER;