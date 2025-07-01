
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
DROP TABLE IF EXISTS project."project" CASCADE;
CREATE TABLE IF NOT EXISTS project."project" (
	project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_slug VARCHAR(255) NOT NULL,
	project_name VARCHAR(255) NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Project

-- Workspace projects join
DROP TABLE IF EXISTS project."workspace_projects" CASCADE;
CREATE TABLE IF NOT EXISTS project."workspace_projects" (
	workspace_id UUID NOT NULL REFERENCES workspace."workspace"(workspace_id) ON DELETE CASCADE,
	project_id UUID NOT NULL REFERENCES project."project"(project_id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES tp_user."user"(user_id) ON DELETE CASCADE
);
-- Workspace projects join

-- Project members
DROP TABLE IF EXISTS project."project_members" CASCADE;
CREATE TABLE IF NOT EXISTS project."project_members" (
	user_id UUID NOT NULL REFERENCES tp_user."user"(user_id) ON DELETE CASCADE,
	project_id UUID NOT NULL REFERENCES project."project"(project_id) ON DELETE CASCADE,
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	project_role INTEGER NOT NULL REFERENCES project."project_role"(id),
	invited_by UUID NOT NULL REFERENCES tp_user."user"(user_id),
	is_active BOOLEAN DEFAULT TRUE,

	PRIMARY KEY(user_id, project_id)
);

DROP INDEX IF EXISTS idx_project_members_user_id;
CREATE INDEX idx_project_members_user_id ON project."project_members"(user_id);
DROP INDEX IF EXISTS idx_project_members_project_id;
CREATE INDEX idx_project_members_project_id ON project."project_members"(project_id);
-- Project members