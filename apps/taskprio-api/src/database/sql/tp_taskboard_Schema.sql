DROP SCHEMA IF EXISTS taskboard CASCADE;
CREATE SCHEMA IF NOT EXISTS taskboard;

-- Task board
DROP TABLE IF EXISTS taskboard."task_board" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_board" (
	task_board_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	project_id UUID NOT NULL REFERENCES project."project",
	task_board_name VARCHAR(255),
	task_board_slug VARCHAR(255),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Task board

-- Task section
DROP TABLE IF EXISTS taskboard."task_section" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_section" (
	task_section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_board_id UUID NOT NULL REFERENCES taskboard."task_board",
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
DROP TABLE IF EXISTS taskboard."task" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task" (
	task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_section_id UUID NOT NULL REFERENCES taskboard."task_section",
	task_title VARCHAR(255) NOT NULL,
	task_description VARCHAR(255),
	task_estimate INTEGER,
	task_deadline VARCHAR(255),
	display_order DOUBLE PRECISION NOT NULL,
	created_by UUID NOT NULL REFERENCES tp_user."user",
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	in_trash BOOLEAN DEFAULT FALSE
);

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
	task_id UUID NOT NULL REFERENCES taskboard."task",
	user_id UUID NOT NULL REFERENCES tp_user."user"
);
-- Task Assignee

-- Task Time Log
DROP TABLE IF EXISTS taskboard."task_time_log" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_time_log" (
	task_id UUID NOT NULL REFERENCES taskboard."task",
	user_id UUID NOT NULL REFERENCES tp_user."user",
	time_spent DOUBLE PRECISION NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Task Time Log