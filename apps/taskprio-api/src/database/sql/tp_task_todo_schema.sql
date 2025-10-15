
-- Task Todo State
DROP TABLE IF EXISTS taskboard."task_todo_state" CASCADE;
CREATE TABLE IF NOT EXISTS taskboard."task_todo_state" (
	task_id UUID NOT NULL REFERENCES taskboard."task",
	user_id UUID NOT NULL REFERENCES tp_user."user",
	work_time_goal BIGINT NOT NULL DEFAULT 900, -- Depracated
	current_work_time BIGINT NOT NULL DEFAULT 0,
	display_order DOUBLE PRECISION NOT NULL,
	active BOOLEAN DEFAULT true,
	session_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Depracated

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
    task_id UUID NOT NULL REFERENCES taskboard."task",
    user_id UUID NOT NULL REFERENCES tp_user."user",
    start NOT NULL TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stop TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    PRIMARY KEY (task_id, user_id, start)
);

-- Constraint to make the table only keep one task timer with stop value of null per user
CREATE UNIQUE INDEX uix_single_active_task_timer_per_user
ON taskboard."task_todo_timer" (user_id)
WHERE stop IS NULL;
-- Task timer timer