-- tbl_company
CREATE TABLE tbl_company (
    company_id bigserial PRIMARY KEY,
    user_name text NOT NULL,
    user_email text NOT NULL,
    user_password text NOT NULL,
    notification_interval INTERVAL NOT NULL DEFAULT INTERVAL '21600' SECOND,
    deactivation_ts TIMESTAMP WITHOUT TIME ZONE,
    registration_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    UNIQUE (user_email)
);

-- tbl_employee (COMPANY 1 to N EMPLOYEES)
CREATE TABLE tbl_employee (
    employee_id bigserial PRIMARY KEY,
    company_id bigint NOT NULL REFERENCES tbl_company(company_id),
    email text NOT NULL,
    goals text[] NOT NULL,
    invite_hash text NOT NULL,
    invite_accepted boolean NOT NULL DEFAULT false,
    invite_sent boolean NOT NULL DEFAULT false,
    gcm_id text,
    last_notification_ts TIMESTAMP WITHOUT TIME ZONE,
    deactivation_ts TIMESTAMP WITHOUT TIME ZONE,
    registration_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    UNIQUE (company_id, email)
);