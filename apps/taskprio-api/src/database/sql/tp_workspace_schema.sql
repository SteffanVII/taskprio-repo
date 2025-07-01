
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
DROP TABLE IF EXISTS workspace."workspace" CASCADE;
CREATE TABLE IF NOT EXISTS workspace."workspace" (
	workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	workspace_slug VARCHAR(255) NOT NULL,
	workspace_name VARCHAR(255) NOT NULL
);
-- Workspace

-- Workspace members
DROP TABLE IF EXISTS workspace."workspace_members" CASCADE;
CREATE TABLE IF NOT EXISTS workspace."workspace_members" (
	workspace_id UUID NOT NULL REFERENCES workspace."workspace"(workspace_id),
	user_id UUID NOT NULL REFERENCES tp_user."user"(user_id),
	workspace_role INTEGER NOT NULL REFERENCES workspace."workspace_role"(id),
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	invited_by UUID NOT NULL REFERENCES tp_user."user"(user_id)
);
-- Workspace members