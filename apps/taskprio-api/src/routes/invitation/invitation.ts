import { Response, Router } from "express";
import { IAcceptInvitationRequest, IInviteToWorkspaceRequest } from "./interfaces.js";
import { resend } from "../../app.js";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "../../database/queries/user/query.js";
import { PoolClient } from "pg";
import { getPoolClient } from "../../database/postgresql.js";
import { TInvitationTokenPayload } from "@repo/taskprio-types";

const registerInvitationRoutes = ( router : Router ) => {

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
                            <p>Click <a href="http://localhost:5001/p/accept?invite_token=${emailWithToken.token}">here</a> to accept the invitation.</p>
                        `
                    }) )
                )

                if ( error ) {
                    console.error(error);
                    res.status(500).json({ message : "Internal server error" });
                    return;
                }

                const {
                    client : newClient,
                    release
                } = await getPoolClient()
                
                client = newClient;
                releaseClient = release;

                await Promise.all( emailsWithToken.map( async email => {

                    await client.query({
                        text : `--sql
                            INSERT INTO workspace_invitation (
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
                res.status(500).json({ message : "Internal server error" });
            } finally {
                releaseClient?.();
            }
        }
    )

    router.post(
        "/workspace/accept/:invitation",
        async ( req : IAcceptInvitationRequest, res : Response ) => {

            const { invitation } = req.params

            try {

                const decodedToken = jwt.verify(invitation, process.env.JSONWEBTOKEN_SECRET) as TInvitationTokenPayload;

                const user = await getUserByEmail( decodedToken.email );

                res.status(200).json({ message : "Invitation accepted" })

            } catch (error) {
                console.error(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

}

export default registerInvitationRoutes