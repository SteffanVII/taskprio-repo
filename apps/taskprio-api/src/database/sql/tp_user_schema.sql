

DROP SCHEMA IF EXISTS tp_user CASCADE;
CREATE SCHEMA IF NOT EXISTS tp_user;

-- User table
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

DROP TRIGGER IF EXISTS update_user_last_modified_timestamp_trigger ON tp_user."user";
CREATE TRIGGER update_user_last_modified_timestamp_trigger
BEFORE INSERT OR UPDATE ON tp_user."user"
FOR EACH ROW
EXECUTE FUNCTION public.update_last_modified_timestamp();