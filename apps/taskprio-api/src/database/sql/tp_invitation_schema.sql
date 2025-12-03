
DROP SCHEMA IF EXISTS invitation CASCADE;
CREATE SCHEMA IF NOT EXISTS invitation;

-- Workspace Invitation
-- Affected queries:
	-- workspace folder query.ts
DROP TABLE IF EXISTS invitation."workspace_invitation" CASCADE;
CREATE TABLE IF NOT EXISTS invitation."workspace_invitation" (
	token_string VARCHAR(512) PRIMARY KEY NOT NULL,
	workspace_id UUID NOT NULL REFERENCES workspace."workspace",
	sender_id UUID NOT NULL REFERENCES tp_user."user",
	email VARCHAR(255) NOT NULL,
	accepted BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS invitation."workspace_invitation_base64" CASCADE;
CREATE VIEW invitation."workspace_invitation_base64" AS
SELECT
	token_string,
	public.uuid_to_base64(workspace_id) AS workspace_id,
	public.uuid_to_base64(sender_id) AS sender_id,
	email,
	accepted,
	created_at
FROM invitation."workspace_invitation";
-- Workspace Invitation