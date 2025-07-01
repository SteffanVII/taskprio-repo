

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;

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