import { PoolClient } from "pg"
import { EDatabaseFunction } from "../../postgresql.js"
import { EProjectRole, EWorkspaceRole, TWorkspaceInvitation, TWorkspaceMember } from "@repo/taskprio-types"
import { taskprioKysely } from "../../kysely/kysely.js"
import { sql } from "kysely"
import { addWorkspaceMember } from "../workspace/mutation.js"
import { addMemberToProjects } from "../project/mutation.js"
import { emitWorkspaceMemberJoined } from "../../../socketio/emitters/workspace.js"

/**
 * Updates the invitation to accepted.
 * REMINDER : This does not add the user to the workspace
 * @param token - The token of the invitation
 * @param workspaceId - The id of the workspace
 * @param email - The email of the recipient
 */

export const acceptInvitation = async (
  token: string,
  workspaceId: string,
  email: string,
  userId: string,
  senderId: string,
  projects: string[]
): Promise<void> => {

  const workspaceMember : TWorkspaceMember =  await taskprioKysely.transaction().execute(async (trx) => {

    await trx.updateTable("invitation.workspace_invitation")
      .set({
        accepted: true
      })
      .where("invitation.workspace_invitation.token_string", "=", token)
      .where("invitation.workspace_invitation.workspace_id", "=", sql<string>`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`)
      .where("invitation.workspace_invitation.email", "=", email)
      .executeTakeFirstOrThrow()

    const workspaceMember = await addWorkspaceMember(
      workspaceId,
      userId,
      EWorkspaceRole.MEMBER,
      senderId,
      trx
    )

    await addMemberToProjects(
      userId,
      senderId,
      EProjectRole.MEMBER,
      projects,
      trx
    )

    return workspaceMember
  })

  emitWorkspaceMemberJoined(workspaceId, {
    data : {
      workspaceId,
      workspaceMember
    }
  })

}

export const createInvitation = async (
  workspaceId: string,
  senderId: string,
  email: string,
  tokenString: string
): Promise<TWorkspaceInvitation> => {

  return await taskprioKysely.transaction().execute(async (trx) => {

    const query = trx.insertInto("invitation.workspace_invitation")
      .values({
        workspace_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${workspaceId})`,
        sender_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${senderId})`,
        email,
        token_string: tokenString

      })
      .returningAll()

    const invitation = await query.executeTakeFirstOrThrow()

    const invitationBase64 = await trx.selectFrom("invitation.workspace_invitation_base64")
      .selectAll()
      .where("token_string", "=", invitation.token_string)
      .executeTakeFirstOrThrow()

    return invitationBase64

  })

}

export const createInvitationBatch = async (
  batch: {
    workspaceId: string,
    senderId: string,
    email: string,
    tokenString: string
  }[]
): Promise<TWorkspaceInvitation[]> => {

  return await taskprioKysely.transaction().execute(async (trx) => {

    const invitations = await Promise.all(batch.map(async (item) => {

      const query = trx.insertInto("invitation.workspace_invitation")
        .values({
          workspace_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${item.workspaceId})`,
          sender_id: sql`${sql.raw(EDatabaseFunction.DETECT_AND_CONVERT_TO_UUID)}(${item.senderId})`,
          email: item.email,
          token_string: item.tokenString
        })
        .returningAll()

      console.log(query.compile().sql)

      await query.executeTakeFirstOrThrow()

      return await trx.selectFrom("invitation.workspace_invitation_base64")
        .selectAll()
        .where("token_string", "=", item.tokenString)
        .executeTakeFirstOrThrow()

    }))

    return invitations

  })

}