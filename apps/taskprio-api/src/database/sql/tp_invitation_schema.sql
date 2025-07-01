
DROP SCHEMA IF EXISTS invitation CASCADE;
CREATE SCHEMA IF NOT EXISTS invitation;

-- Workspace Invitation
DROP TABLE IF EXISTS invitation."workspace_invitation" CASCADE;
CREATE TABLE IF NOT EXISTS invitation."workspace_invitation" (
	token_string VARCHAR(512) PRIMARY KEY NOT NULL,
	workspace_id UUID NOT NULL REFERENCES workspace."workspace",
	sender_id UUID NOT NULL REFERENCES tp_user."user",
	email VARCHAR(255) NOT NULL,
	accepted BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
-- Workspace Invitation