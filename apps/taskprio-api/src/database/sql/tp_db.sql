
\set ON_ERROR_STOP on
BEGIN;

CREATE EXTENSION IF NOT EXISTS plpgsql;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\i tp_public_schema.sql
\i tp_user_schema.sql
\i tp_workspace_schema.sql
\i tp_project_schema.sql
\i tp_taskboard_schema.sql
\i tp_invitation_schema.sql

COMMIT;