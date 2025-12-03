
DROP SCHEMA IF EXISTS project CASCADE;
CREATE SCHEMA IF NOT EXISTS project;

-- Project role
DROP TABLE IF EXISTS project."project_role" CASCADE;
CREATE TABLE IF NOT EXISTS project."project_role" (
	id SERIAL PRIMARY KEY,
	role_name VARCHAR(255) NOT NULL
);
INSERT INTO project."project_role" (role_name) VALUES ('owner');
INSERT INTO project."project_role" (role_name) VALUES ('member');
INSERT INTO project."project_role" (role_name) VALUES ('guest');
-- Project role

-- Project
-- Affected queries:
	-- project mutation/query.ts
DROP TABLE IF EXISTS project."project" CASCADE;
CREATE TABLE IF NOT EXISTS project."project" (
	workspace_id UUID NOT NULL REFERENCES workspace."workspace"(workspace_id),
	project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_name VARCHAR(255) NOT NULL,
	project_abbreviation VARCHAR(16) NOT NULL,
	project_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
	active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by UUID NOT NULL REFERENCES tp_user."user"(user_id)
);

DROP VIEW IF EXISTS project."project_base64" CASCADE;
CREATE VIEW project."project_base64" AS
SELECT
	project_name,
	created_at,
	project_abbreviation,
	project_color,
	active,
	public.uuid_to_base64(workspace_id) AS workspace_id,
	public.uuid_to_base64(project_id) AS project_id,
	public.uuid_to_base64(created_by) AS created_by
FROM project."project";
-- Project

-- Workspace projects join
-- Affected queries:
	-- project folder mutation/query.ts
	-- workspace folder query.ts
DROP TABLE IF EXISTS project."workspace_projects" CASCADE;
CREATE TABLE IF NOT EXISTS project."workspace_projects" (
	workspace_id UUID NOT NULL REFERENCES workspace."workspace"(workspace_id) ON DELETE CASCADE,
	project_id UUID NOT NULL REFERENCES project."project"(project_id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES tp_user."user"(user_id),

	PRIMARY KEY (workspace_id, project_id)
);

DROP VIEW IF EXISTS project."workspace_projects_base64" CASCADE;
CREATE VIEW project."workspace_projects_base64" AS
SELECT
	public.uuid_to_base64(workspace_id) AS workspace_id,
	public.uuid_to_base64(project_id) AS project_id,
	public.uuid_to_base64(user_id) AS user_id
FROM project."workspace_projects";
-- Workspace projects join

-- Project members
-- Affected queries:
	-- project mutation/query.ts
DROP TABLE IF EXISTS project."project_members" CASCADE;
CREATE TABLE IF NOT EXISTS project."project_members" (
	user_id UUID NOT NULL REFERENCES tp_user."user"(user_id) ON DELETE CASCADE,
	project_id UUID NOT NULL REFERENCES project."project"(project_id) ON DELETE CASCADE,
	joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	project_role INTEGER NOT NULL REFERENCES project."project_role"(id),
	invited_by UUID NOT NULL REFERENCES tp_user."user"(user_id),
	is_active BOOLEAN DEFAULT TRUE,

	PRIMARY KEY(user_id, project_id)
);

DROP INDEX IF EXISTS idx_project_members_user_id;
CREATE INDEX idx_project_members_user_id ON project."project_members"(user_id);
DROP INDEX IF EXISTS idx_project_members_project_id;
CREATE INDEX idx_project_members_project_id ON project."project_members"(project_id);

DROP VIEW IF EXISTS project."project_members_base64" CASCADE;
CREATE VIEW project."project_members_base64" AS
SELECT
	joined_at,
	is_active,
	project_role,
	public.uuid_to_base64(user_id) AS user_id,
	public.uuid_to_base64(project_id) AS project_id,
	public.uuid_to_base64(invited_by) AS invited_by
FROM project."project_members";
-- Project members

-- Project tags
DROP TABLE IF EXISTS project."project_tags" CASCADE;
CREATE TABLE IF NOT EXISTS project."project_tags" (
	tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	tag_name VARCHAR(255) NOT NULL,
	tag_color VARCHAR(255) NOT NULL,
	project_id UUID NOT NULL REFERENCES project."project"(project_id) ON DELETE CASCADE
);

DROP VIEW IF EXISTS project."project_tags_base64" CASCADE;
CREATE VIEW project."project_tags_base64" AS
SELECT
	tag_name,
	tag_color,
	public.uuid_to_base64(tag_id) AS tag_id,
	public.uuid_to_base64(project_id) AS project_id
FROM project."project_tags";
-- Project tags