

CREATE OR REPLACE PROCEDURE tp_add_user_to_workspace(
    p_user_id UUID,
    p_workspace_id UUID,
    p_workspace_role INT,
    p_projects UUID[] DEFAULT '{}'
    p_invited_by UUID,
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO workspace."workspace_members" (
        workspace_id,
        user_id,
        workspace_role,
        invited_by
    ) VALUES (
        p_workspace_id,
        p_user_id,
        p_workspace_role,
        p_invited_by
    )
END
$$;