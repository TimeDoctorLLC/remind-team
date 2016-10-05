DROP DATABASE IF EXISTS goalreminder_test;

DROP ROLE IF EXISTS grtest_role;

CREATE ROLE grtest_role LOGIN PASSWORD 'sbKv76x7a56m6EEnQcQSvKCn';

CREATE DATABASE goalreminder_test WITH OWNER grtest_role 
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       CONNECTION LIMIT = -1
	TEMPLATE = template0;
    
\c goalreminder_test

\i sql/database.sql

GRANT ALL PRIVILEGES ON DATABASE goalreminder_test TO grtest_role;

-- FIXME configure it to work without superuser permissions!
ALTER USER grtest_role WITH SUPERUSER;