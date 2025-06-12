import { Response, Router } from "express";
import { IAcceptInvitationRequest, IInviteToWorkspaceRequest } from "./interfaces.js";
import { resend } from "../../app.js";
import jwt from "jsonwebtoken";
import { TInvitationTokenPayload } from "./types.js";
import { getUserByEmail } from "../../database/queries/user/query.js";

const registerInvitationRoutes = ( router : Router ) => {

    router.post(
        "/workspace/:workspace_id",
        async ( req : IInviteToWorkspaceRequest, res : Response ) => {

            const { workspace_id } = req.params;
            const { projects, emails } = req.body;
            const { user_id } = req.user;

            if ( !workspace_id || !projects || !emails ) {
                res.status(400).json({ message : "Invalid request" });
                return;
            }

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
                            <p>You've been invited to a workspace by ${user_id}.</p>
                            <p>Click <a href="https://app.000184.xyz/workspace/${workspace_id}">here</a> to accept the invitation.</p>
                        `
                    }) )
                )

                if ( error ) {
                    console.error(error);
                    res.status(500).json({ message : "Internal server error" });
                    return;
                }

                res.status(200).json({ message : "Invitation sent" });

            } catch (error) {
                console.error(error);
                res.status(500).json({ message : "Internal server error" });
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

            } catch (error) {
                console.error(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

}

export default registerInvitationRoutes