
-- Task Todo State
DROP TABLE IF EXISTS taskboard."task_todo_state" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_todo_state" (
	task_id UUID NOT NULL REFERENCES taskboard."task" ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES tp_user."user",
	work_time_goal BIGINT NOT NULL DEFAULT 900,
	current_work_time BIGINT NOT NULL DEFAULT 0, -- Depracated
	display_order DOUBLE PRECISION NOT NULL,
	active BOOLEAN DEFAULT true,
	completed BOOLEAN DEFAULT false,
	session_started_at TIMESTAMP DEFAULT NULL, -- Depracated

	PRIMARY KEY (task_id, user_id)
);

DROP VIEW IF EXISTS taskboard."task_todo_state_base64" CASCADE;
CREATE VIEW taskboard."task_todo_state_base64" AS
SELECT
	public.uuid_to_base64(task_id) AS task_id,
	public.uuid_to_base64(user_id) AS user_id,
	work_time_goal,
	current_work_time,
	display_order,
	active,
	session_started_at
FROM taskboard."task_todo_state";
-- Task Todo State

-- Task todo timer
DROP TABLE IF EXISTS taskboard."task_todo_timer" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_todo_timer" (
	workspace_id UUID NOT NULL REFERENCES workspace."workspace", -- Use for a container to group timers
    task_id UUID NOT NULL REFERENCES taskboard."task" ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES tp_user."user",
	task_time_log_id UUID REFERENCES tp_taskboard."task_time_log",
	last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start NOT NULL TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stop TIMESTAMP DEFAULT NULL,

    PRIMARY KEY (task_id, user_id, start)
);

-- Constraint to make the table only keep one task timer with stop value of null per user per workspace
CREATE UNIQUE INDEX uix_single_active_task_timer_per_user_workspace
ON taskboard."task_todo_timer" (workspace_id, user_id)
WHERE stop IS NULL;
-- Task timer timer

-- Task todo session history
DROP TABLE IF EXISTS taskboard."task_todo_session_history" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_todo_session_history" (
	task_todo_session_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	workspace_id UUID NOT NULL REFERENCES workspace."workspace" ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES tp_user."user",
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task todo state snapshot
DROP TABLE IF EXISTS taskboard."task_todo_state_snapshot" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_todo_state_snapshot" (
	task_todo_state_snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	task_todo_session_history_id UUID NOT NULL REFERENCES taskboard."task_todo_session_history" ON DELETE CASCADE,
	task_id UUID REFERENCES taskboard."task",
	user_id UUID NOT NULL REFERENCES tp_user."user" ON DELETE CASCADE,
	project_id UUID REFERENCES project."project",
	work_time_goal BIGINT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	completed BOOLEAN DEFAULT false,

	-- Task data
	task_title VARCHAR(255) NOT NULL,
	task_depth INTEGER NOT NULL,

	-- Project data
	project_name VARCHAR(255) NOT NULL,
	project_abbreviation VARCHAR(16) NOT NULL,
	project_color VARCHAR(7) NOT NULL
);

-- Task todo state snapshot timers
DROP TABLE IF EXISTS taskboard."task_todo_state_snapshot_timer" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_todo_state_snapshot_timer" (
	task_todo_state_snapshot_id UUID NOT NULL REFERENCES taskboard."task_todo_state_snapshot" ON DELETE CASCADE,
	workspace_id UUID NOT NULL REFERENCES workspace."workspace",
	task_id UUID REFERENCES taskboard."task",
    user_id UUID NOT NULL REFERENCES tp_user."user" ON DELETE CASCADE,
	task_time_log_id UUID REFERENCES taskboard."task_time_log",
	last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start TIMESTAMP NOT NULL,
    stop TIMESTAMP NOT NULL
);