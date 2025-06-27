CREATE EXTENSION IF NOT EXISTS plpgsql;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update last_modified before INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.update_last_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the operation is INSERT or UPDATE
    IF (TG_OP = 'UPDATE') THEN
        -- Set the 'last_modified' column of the new row to the current timestamp
        NEW.last_modified = NOW();
        RETURN NEW; -- Return the modified new row
    ELSIF (TG_OP = 'INSERT') THEN
        -- If it's an insert, ensure last_modified is set (optional, could use DEFAULT)
        NEW.last_modified = NOW();
        RETURN NEW; -- Return the new row
    END IF;

    -- For DELETE operations or if TG_OP is something else, just return OLD or NEW appropriately
    -- In a BEFORE DELETE trigger, you'd typically return OLD.
    -- For this example, we only really care about UPDATE/INSERT
    RETURN NEW; -- Or OLD, depending on context and timing

END;
$$ LANGUAGE plpgsql;

-- User table
DROP TABLE IF EXISTS public."user" CASCADE;
CREATE TABLE IF NOT EXISTS public."user" (
	user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255) NOT NULL,
	firstname VARCHAR(255) NOT NULL,
	lastname VARCHAR(255) NOT NULL,
	password_hashed VARCHAR(255),
	google_user_id VARCHAR(255),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	last_modified TIMESTAMP WITH TIME ZONE,

	CONSTRAINT users_email_unique UNIQUE (email)
);

DROP TRIGGER IF EXISTS update_user_last_modified_timestamp_trigger ON public."user";
CREATE TRIGGER update_user_last_modified_timestamp_trigger
BEFORE INSERT OR UPDATE ON public."user"
FOR EACH ROW
EXECUTE FUNCTION public.update_last_modified_timestamp();

-- INSERT INTO public."user" (
-- 	email,
-- 	firstname,
-- 	lastname,
-- 	password_hashed
-- )
-- VALUES (
-- 	'abaochrisjay@gmail.com',
-- 	'Chris Jay',
-- 	'Abao',
-- 	'Polaris_1'
-- )
-- User table

-- Workspace Role
DROP TABLE IF EXISTS public."workspace_role" CASCADE;
CREATE TABLE IF NOT EXISTS public."workspace_role" (
	id SERIAL PRIMARY KEY,
	role_name VARCHAR(255) NOT NULL
);
INSERT INTO public."workspace_role" (role_name) VALUES ('owner');
INSERT INTO public."workspace_role" (role_name) VALUES ('member');
INSERT INTO public."workspace_role" (role_name) VALUES ('guest');
-- Workspace Role

-- Workspace
DROP TABLE IF EXISTS public."workspace" CASCADE;
CREATE TABLE IF NOT EXISTS public."workspace" (
	workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	workspace_slug VARCHAR(255) NOT NULL,
	workspace_name VARCHAR(255) NOT NULL
);
-- Workspace

-- Workspace members
DROP TABLE IF EXISTS public."workspace_members" CASCADE;
CREATE TABLE IF NOT EXISTS public."workspace_members" (
	workspace_id UUID NOT NULL REFERENCES public."workspace"(workspace_id),
	user_id UUID NOT NULL REFERENCES public."user"(user_id),
	workspace_role INTEGER NOT NULL REFERENCES public."workspace_role"(id),
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	invited_by UUID NOT NULL REFERENCES public."user"(user_id)
);
-- Workspace members

-- Project role
DROP TABLE IF EXISTS public."project_role" CASCADE;
CREATE TABLE IF NOT EXISTS public."project_role" (
	id SERIAL PRIMARY KEY,
	role_name VARCHAR(255) NOT NULL
);
INSERT INTO public."project_role" (role_name) VALUES ('owner');
INSERT INTO public."project_role" (role_name) VALUES ('member');
INSERT INTO public."project_role" (role_name) VALUES ('guest');
-- Project role

-- Project
DROP TABLE IF EXISTS public."project" CASCADE;
CREATE TABLE IF NOT EXISTS public."project" (
	project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_slug VARCHAR(255) NOT NULL,
	project_name VARCHAR(255) NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Project

-- Workspace projects join
DROP TABLE IF EXISTS public."workspace_projects" CASCADE;
CREATE TABLE IF NOT EXISTS public."workspace_projects" (
	workspace_id UUID NOT NULL REFERENCES public."workspace"(workspace_id) ON DELETE CASCADE,
	project_id UUID NOT NULL REFERENCES public."project"(project_id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES public."user"(user_id) ON DELETE CASCADE
);
-- Workspace projects join

-- Project members
DROP TABLE IF EXISTS public."project_members" CASCADE;
CREATE TABLE IF NOT EXISTS public."project_members" (
	user_id UUID NOT NULL REFERENCES public."user"(user_id) ON DELETE CASCADE,
	project_id UUID NOT NULL REFERENCES public."project"(project_id) ON DELETE CASCADE,
	joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	project_role INTEGER NOT NULL REFERENCES public."project_role"(id),
	invited_by UUID NOT NULL REFERENCES public."user"(user_id),
	is_active BOOLEAN DEFAULT TRUE,

	PRIMARY KEY(user_id, project_id)
);

DROP INDEX IF EXISTS idx_project_members_user_id;
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
DROP INDEX IF EXISTS idx_project_members_project_id;
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
-- Project members

-- Task board
DROP TABLE IF EXISTS public."task_board" CASCADE;
CREATE TABLE IF NOT EXISTS public."task_board" (
	task_board_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_id UUID NOT NULL REFERENCES public."project",
	task_board_name VARCHAR(255),
	task_board_slug VARCHAR(255),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Task board

-- Task section
DROP TABLE IF EXISTS public."task_section" CASCADE;
CREATE TABLE IF NOT EXISTS public."task_section" (
	task_section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_board_id UUID NOT NULL REFERENCES public."task_board",
	task_section_name VARCHAR(255) NOT NULL,
	display_order DOUBLE PRECISION NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Task section

-- Task
-- Affected functions:
--		Mutations:
--			createTask
--			updateTaskPrimitiveFields
--			addTaskAssignee
--			removeTaskAssignee
--		Queries:
--			getTask
--			getTaskboardSectionsWithTasks
DROP TABLE IF EXISTS public."task" CASCADE;
CREATE TABLE IF NOT EXISTS public."task" (
	task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_section_id UUID NOT NULL REFERENCES public."task_section",
	task_title VARCHAR(255) NOT NULL,
	task_description VARCHAR(255),
	task_estimate INTEGER,
	task_deadline VARCHAR(255),
	display_order DOUBLE PRECISION NOT NULL,
	created_by UUID NOT NULL REFERENCES public."user",
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	in_trash BOOLEAN DEFAULT FALSE
);

DROP TRIGGER IF EXISTS update_task_last_modified_timestamp_trigger ON public."task";
CREATE TRIGGER update_task_last_modified_timestamp_trigger
BEFORE INSERT OR UPDATE ON public."task"
FOR EACH ROW
EXECUTE FUNCTION public.update_last_modified_timestamp();
-- Task

-- Task Assignee
DROP TABLE IF EXISTS public."task_assignee" CASCADE;
CREATE TABLE IF NOT EXISTS public."task_assignee" (
	task_id UUID NOT NULL REFERENCES public."task",
	user_id UUID NOT NULL REFERENCES public."user"
);
-- Task Assignee

-- Task Time Log
DROP TABLE IF EXISTS public."task_time_log" CASCADE;
CREATE TABLE IF NOT EXISTS public."task_time_log" (
	task_id UUID NOT NULL REFERENCES public."task",
	user_id UUID NOT NULL REFERENCES public."user",
	time_spent DOUBLE PRECISION NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Task Time Log

-- Workspace Invitation
DROP TABLE IF EXISTS public."workspace_invitation" CASCADE;
CREATE TABLE IF NOT EXISTS public."workspace_invitation" (
	token_string VARCHAR(512) PRIMARY KEY NOT NULL,
	workspace_id UUID NOT NULL REFERENCES public."workspace",
	sender_id UUID NOT NULL REFERENCES public."user",
	email VARCHAR(255) NOT NULL,
	accepted BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
-- Workspace Invitation
































