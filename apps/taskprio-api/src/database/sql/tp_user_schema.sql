

DROP SCHEMA IF EXISTS tp_user CASCADE;
CREATE SCHEMA IF NOT EXISTS tp_user;

-- User table
-- Affected queries:
	-- user folder mutation/query.ts
	-- workspace folder query.ts
DROP TABLE IF EXISTS tp_user."user" CASCADE;
CREATE TABLE IF NOT EXISTS tp_user."user" (
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

DROP VIEW IF EXISTS tp_user."user_base64" CASCADE;
CREATE VIEW tp_user."user_base64" AS
SELECT
	public.uuid_to_base64(user_id) AS user_id,
	email,
	firstname,
	lastname,
	password_hashed,
	google_user_id,
	created_at,
	last_modified
FROM tp_user."user";

DROP VIEW IF EXISTS tp_user."user_secure" CASCADE;
CREATE VIEW tp_user."user_secure" AS
SELECT
	public.uuid_to_base64(user_id) AS user_id,
	email,
	firstname,
	lastname,
	created_at,
	last_modified
FROM tp_user."user";

DROP VIEW IF EXISTS tp_user."user_secure_base64" CASCADE;
CREATE VIEW tp_user."user_secure_base64" AS
SELECT
	public.uuid_to_base64(user_id) AS user_id,
	email,
	firstname,
	lastname,
	created_at,
	last_modified
FROM tp_user."user";

DROP TRIGGER IF EXISTS update_user_last_modified_timestamp_trigger ON tp_user."user";
CREATE TRIGGER update_user_last_modified_timestamp_trigger
BEFORE INSERT OR UPDATE ON tp_user."user"
FOR EACH ROW
EXECUTE FUNCTION public.update_last_modified_timestamp();

DROP TABLE IF EXISTS tp_user."user_profile_photo" CASCADE;
CREATE TABLE IF NOT EXISTS tp_user."user_profile_photo" (
	user_id UUID PRIMARY KEY NOT NULL REFERENCES tp_user."user",
	photo_file_name VARCHAR(255) NOT NULL,
	image_type VARCHAR(5) NOT NULL,
	crop_x FLOAT NOT NULL,
	crop_y FLOAT NOT NULL,
	crop_width FLOAT NOT NULL,
	crop_height FLOAT NOT NULL
);

DROP VIEW IF EXISTS tp."user_profile_photo" CASCADE;
CREATE VIEW tp_user."user_profile_photo_base64" AS
SELECT
	public.uuid_to_base64(user_id) AS user_id,
	photo_file_name,
	image_type,
	crop_x,
	crop_y,
	crop_width,
	crop_height
FROM tp_user."user_profile_photo";