import { Response, Router } from "express";
import { IAcceptInvitationRequest, IGetInvitationInfoRequest, IInviteToWorkspaceRequest } from "./interfaces.js";
import { resend } from "../../app.js";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "../../database/queries/user/query.js";
import { PoolClient } from "pg";
import { getPoolClient } from "../../database/postgresql.js";
import { EProjectRole, EWorkspaceRole, IGetInvitationInfoResponseData, TInvitationTokenDecoded } from "@repo/taskprio-types";
import { getInvitationByToken_WorkspaceId_Recipient } from "../../database/queries/invitation/query.js";
import { addWorkspaceMember } from "../../database/queries/workspace/mutation.js";
import { acceptInvitation } from "../../database/queries/invitation/mutation.js";
import { addMemberToProjects, addProjectMember } from "../../database/queries/project/mutation.js";

const registerInvitationRoutes = ( router : Router ) => {

    router.get(
        "/workspace/info/:token",
        async ( req : IGetInvitationInfoRequest, res : Response ) => {

            const { token } = req.params;

            try {

                const decodedToken = jwt.verify(token, process.env.JSONWEBTOKEN_SECRET) as TInvitationTokenDecoded;

                const user = await getUserByEmail(
                    decodedToken.email
                )

                const invitation = await getInvitationByToken_WorkspaceId_Recipient(
                    token,
                    decodedToken.workspace_id,
                    decodedToken.email
                )

                const returnData : IGetInvitationInfoResponseData = {
                    sender_id : decodedToken.sender_id,
                    email : decodedToken.email,
                    is_invitation_exists : true,
                    is_user_exists : true,
                    accepted : false
                }

                if ( !user ) {
                    returnData.is_user_exists = false
                }

                if ( !invitation ) {
                    returnData.is_invitation_exists = false
                }

                if ( invitation && invitation.accepted ) {
                    returnData.accepted = true
                }

                res.status(200).json(returnData)

            } catch (error) {
                res.status(500).json({ message : "Invalid token or expired" });
            }

        }
    )

    router.post(
        "/workspace/:workspace_id",
        async ( req : IInviteToWorkspaceRequest, res : Response ) => {

            const { workspace_id } = req.params;
            const { projects, emails } = req.body;
            const { user_id, email : user_email } = req.user;

            if ( !workspace_id || !projects || !emails ) {
                res.status(400).json({ message : "Invalid request" });
                return;
            }

            let client : PoolClient;
            let releaseClient : () => void;

            try {

                // Convert emails string array to a array of objects with email and token
                const emailsWithToken = emails.map( email => {

                    const token = jwt.sign(
                        {
                            sender_id : user_id,
                            email,
                            workspace_id,
                            projects
                        },
                        process.env.JSONWEBTOKEN_SECRET,
                        {
                            expiresIn : "7d"
                        }
                    )

                    return {
                        email,
                        token
                    }

                } )

                // Send emails using resend batch
                // When one of the emails fails, the whole batch fails
                const {
                    error
                } = await resend.batch.send(
                    emailsWithToken.map( emailWithToken => ({
                        from : "Taskprio Team <app@app.000184.xyz>",
                        to : emailWithToken.email,
                        subject : "You've been invited to a workspace",
                        html : `
                            <h1>You've been invited to a workspace</h1>
                            <p>You've been invited to a workspace by ${user_email}.</p>
                            <p>Click <a href="http://localhost:5001/accept?invite_token=${emailWithToken.token}">here</a> to accept the invitation.</p>
                        `
                    }) )
                )

                // If the batch fails, return the error
                if ( error ) {
                    console.error(error);
                    res.status(500).json({ message : "There was an error sending the invitations" });
                    return;
                }


                const {
                    client : newClient,
                    release
                } = await getPoolClient()
                
                client = newClient;
                releaseClient = release;

                // Insert the invitations into the database
                await Promise.all( emailsWithToken.map( async email => {

                    await client.query({
                        text : `--sql
                            INSERT INTO invitation."workspace_invitation" (
                                workspace_id,
                                sender_id,
                                email,
                                token_string,
                                accepted
                            ) VALUES (
                                $1, $2, $3, $4, $5
                            )
                        `,
                        values : [
                            workspace_id,
                            user_id,
                            email.email,
                            email.token,
                            false
                        ]
                    })

                } ) )

                res.status(200).json({ message : "Invitation sent" });

            } catch (error) {
                console.error(error);
                if ( client ) await client.query("ROLLBACK");
                res.status(500).json({ message : "There was an error sending the invitations" });
            } finally {
                releaseClient?.();
            }
        }
    )

    router.post(
        "/workspace/accept/:invitation",
        async ( req : IAcceptInvitationRequest, res : Response ) => {

            const { email } = req.user
            const { invitation : invitationToken } = req.params

            try {

                // Decode the token
                const decodedToken = jwt.verify(invitationToken, process.env.JSONWEBTOKEN_SECRET) as TInvitationTokenDecoded;

                if ( decodedToken.email !== email ) {
                    res.status(400).json({ message : "You are not the recipient of this invitation" });
                    return
                }

                // If the token has expired, return an error
                if ( decodedToken.exp && decodedToken.exp < Date.now() / 1000 ) {
                    res.status(400).json({ message : "Invitation expired" });
                    return;
                }

                // Get the user by email
                const user = await getUserByEmail(decodedToken.email)

                // If the user does not exist, return an error
                if ( !user ) {
                    res.status(400).json({ message : "User not found" });
                    return;
                }

                // Get the invitation by token, workspace_id and email
                const invitation = await getInvitationByToken_WorkspaceId_Recipient(
                    invitationToken,
                    decodedToken.workspace_id,
                    decodedToken.email
                )

                if ( !invitation ) {
                    res.status(404).json({ message : "Invitation not found" });
                }

                if ( invitation.accepted ) {
                    res.status(400).json({ message : "Invitation already accepted" });
                    return;
                }

                await acceptInvitation(
                    invitationToken,
                    decodedToken.workspace_id,
                    decodedToken.email
                )

                console.log("Checkpoint 1");
                
                await addWorkspaceMember(
                    invitation.workspace_id,
                    user.user_id,
                    invitation.email,
                    EWorkspaceRole.MEMBER,
                    invitation.sender_id
                )

                console.log("Checkpoint 2");

                console.log(decodedToken.projects);

                await addMemberToProjects(
                    user.user_id,
                    invitation.sender_id,
                    EProjectRole.MEMBER,
                    decodedToken.projects
                )

                res.status(200).json({ message : "Invitation accepted" })

            } catch (error) {
                console.error(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

}

export default registerInvitationRoutes