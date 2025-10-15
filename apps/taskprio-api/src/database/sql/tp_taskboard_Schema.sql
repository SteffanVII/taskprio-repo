DROP SCHEMA IF EXISTS taskboard CASCADE;
CREATE SCHEMA IF NOT EXISTS taskboard;

-- Task board
DROP TABLE IF EXISTS taskboard."task_board" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_board" (
	task_board_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_id UUID NOT NULL REFERENCES project."project",
	task_board_name VARCHAR(255),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS taskboard."task_board_base64" CASCADE;
CREATE VIEW taskboard."task_board_base64" AS
SELECT
	task_board_name,
	created_at,
	public.uuid_to_base64(task_board_id) AS task_board_id,
	public.uuid_to_base64(project_id) AS project_id
FROM taskboard."task_board";
-- Task board

-- Task section
DROP TABLE IF EXISTS taskboard."task_section" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_section" (
	task_section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_board_id UUID NOT NULL REFERENCES taskboard."task_board",
	task_section_name VARCHAR(255) NOT NULL,
	task_section_color VARCHAR(7),
	display_order DOUBLE PRECISION NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT task_section_color_check CHECK (task_section_color IS NULL OR task_section_color ~ '^#([0-9a-fA-F]{6})$')
);

DROP VIEW IF EXISTS taskboard."task_section_base64" CASCADE;
CREATE VIEW taskboard."task_section_base64" AS
SELECT
	task_section_name,
	task_section_color,
	display_order,
	created_at,
	public.uuid_to_base64(task_section_id) AS task_section_id,
	public.uuid_to_base64(task_board_id) AS task_board_id
FROM taskboard."task_section";
-- Task section

-- Task
-- Affected functions:
DROP TABLE IF EXISTS taskboard."task" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task" (
	task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_board_id UUID NOT NULL REFERENCES taskboard."task_board",
	task_section_id UUID NOT NULL REFERENCES taskboard."task_section",
	task_title VARCHAR(255) NOT NULL,
	task_description TEXT,
	task_estimate INTEGER,
	task_deadline VARCHAR(255),
	task_depth INTEGER NOT NULL DEFAULT 0,
	display_order DOUBLE PRECISION NOT NULL,
	created_by UUID NOT NULL REFERENCES tp_user."user",
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	in_trash BOOLEAN DEFAULT FALSE
);

DROP VIEW IF EXISTS taskboard."task_base64" CASCADE;
CREATE VIEW taskboard."task_base64" AS
SELECT
	task_title,
	task_description,
	task_estimate,
	task_deadline,
	task_board_id,
	display_order,
	created_at,
	last_modified,
	in_trash,
	public.uuid_to_base64(task_id) AS task_id,
	public.uuid_to_base64(task_section_id) AS task_section_id,
	public.uuid_to_base64(created_by) AS created_by
FROM taskboard."task";

DROP TRIGGER IF EXISTS update_task_last_modified_timestamp_trigger ON taskboard."task";
CREATE TRIGGER update_task_last_modified_timestamp_trigger
BEFORE INSERT OR UPDATE ON taskboard."task"
FOR EACH ROW
EXECUTE FUNCTION public.update_last_modified_timestamp();
-- Task

-- Task Assignee
-- Affected functions:
--		Mutations:
--			addTaskAssignee
--			removeTaskAssignee
DROP TABLE IF EXISTS taskboard."task_assignee" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_assignee" (
	task_id UUID NOT NULL REFERENCES taskboard."task" ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES tp_user."user" ON DELETE CASCADE,

	PRIMARY KEY (task_id, user_id)
);

DROP VIEW IF EXISTS taskboard."task_assignee_base64" CASCADE;
CREATE VIEW taskboard."task_assignee_base64" AS
SELECT
	public.uuid_to_base64(task_id) AS task_id,
	public.uuid_to_base64(user_id) AS user_id
FROM taskboard."task_assignee";
-- Task Assignee

-- Task Time Log
DROP TABLE IF EXISTS taskboard."task_time_log" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_time_log" (
	task_time_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_id UUID NOT NULL REFERENCES taskboard."task",
	user_id UUID NOT NULL REFERENCES tp_user."user",
	time_spent DOUBLE PRECISION NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS taskboard."task_time_log_base64" CASCADE;
CREATE VIEW taskboard."task_time_log_base64" AS
SELECT
	public.uuid_to_base64(task_time_log_id) AS task_time_log_id,
	time_spent,
	created_at,
	public.uuid_to_base64(task_id) AS task_id,
	public.uuid_to_base64(user_id) AS user_id
FROM taskboard."task_time_log";
-- Task Time Log

-- Task Tag
DROP TABLE IF EXISTS taskboard."task_tag" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_tag" (
	task_id UUID NOT NULL REFERENCES taskboard."task" ON DELETE CASCADE,
	tag_id UUID NOT NULL REFERENCES project."project_tags" ON DELETE CASCADE,

	PRIMARY KEY (task_id, tag_id)
);

DROP VIEW IF EXISTS taskboard."task_tag_base64" CASCADE;
CREATE VIEW taskboard."task_tag_base64" AS
SELECT
	public.uuid_to_base64(task_id) AS task_id,
	public.uuid_to_base64(tag_id) AS tag_id
FROM taskboard."task_tag";
-- Task Tag

-- Task Comment
DROP TABLE IF EXISTS taskboard."task_comment" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_comment" (
	task_comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_id UUID NOT NULL REFERENCES taskboard."task",
	user_id UUID NOT NULL REFERENCES tp_user."user",
	comment_content TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	edited_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
	replying_to_task_comment_id UUID REFERENCES taskboard."task_comment" DEFAULT NULL
);

DROP TRIGGER IF EXISTS update_task_comment_last_modified_timestamp_trigger ON taskboard."task_comment";
CREATE TRIGGER update_task_comment_last_modified_timestamp_trigger
BEFORE UPDATE ON taskboard."task_comment"
FOR EACH ROW
EXECUTE FUNCTION public.update_last_modified_timestamp();
-- Task Comment