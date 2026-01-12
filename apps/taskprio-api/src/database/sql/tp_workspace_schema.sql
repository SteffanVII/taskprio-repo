
DROP SCHEMA IF EXISTS workspace CASCADE;
CREATE SCHEMA IF NOT EXISTS workspace;

-- Workspace Role
DROP TABLE IF EXISTS workspace."workspace_role" CASCADE;
CREATE TABLE IF NOT EXISTS workspace."workspace_role" (
	id SERIAL PRIMARY KEY,
	role_name VARCHAR(255) NOT NULL
);
INSERT INTO workspace."workspace_role" (role_name) VALUES ('owner');
INSERT INTO workspace."workspace_role" (role_name) VALUES ('member');
INSERT INTO workspace."workspace_role" (role_name) VALUES ('guest');
-- Workspace Role

-- Workspace
-- Affected queries:
	-- workspace folder mutation/query.ts
DROP TABLE IF EXISTS workspace."workspace" CASCADE;
CREATE TABLE IF NOT EXISTS workspace."workspace" (
	workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	workspace_name VARCHAR(255) NOT NULL
);

DROP VIEW IF EXISTS workspace."workspace_base64" CASCADE;
CREATE VIEW workspace."workspace_base64" AS
SELECT
	workspace_name,
	public.uuid_to_base64(workspace_id) AS workspace_id
FROM workspace."workspace";
-- Workspace

-- Workspace members
-- Affected queries:
	-- workspace folder mutation/query.ts
DROP TABLE IF EXISTS workspace."workspace_members" CASCADE;
CREATE TABLE IF NOT EXISTS workspace."workspace_members" (
	workspace_id UUID NOT NULL REFERENCES workspace."workspace"(workspace_id),
	user_id UUID NOT NULL REFERENCES tp_user."user"(user_id),
	workspace_role INTEGER NOT NULL REFERENCES workspace."workspace_role"(id),
	joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	invited_by UUID NOT NULL REFERENCES tp_user."user"(user_id),
	is_active BOOLEAN DEFAULT TRUE,

	PRIMARY KEY (workspace_id, user_id)
);

DROP VIEW IF EXISTS workspace."workspace_members_base64" CASCADE;
CREATE VIEW workspace."workspace_members_base64" AS
SELECT
	joined_at,
	workspace_role,
	public.uuid_to_base64(workspace_id) AS workspace_id,
	public.uuid_to_base64(user_id) AS user_id,
	public.uuid_to_base64(invited_by) AS invited_by
FROM workspace."workspace_members";
-- Workspace members