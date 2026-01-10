import { Request, Response, Router } from "express";
import { googleAuthClient } from "../../app.js";

function registerRedirectRoutes(router: Router) {

    router.get(
        `/google_login`,
        async (req: Request, res: Response) => {
            // const { credential, client_id } = req.body;
            const {
                code,
            } = req.query;
            console.log(req.query)
            const payload = await googleAuthClient.getToken(code as string)
            console.log(payload)
            // const redirectUrl = new URL('taskprio-app://googlelogin');
            // if (credential) redirectUrl.searchParams.append('credential', credential);
            // if (client_id) redirectUrl.searchParams.append('clientId', client_id);
            // res.redirect(302, redirectUrl.toString())
            res.status(200)
        }
    )

    router.post(
        `/google_login`,
        async (req: Request, res: Response) => {
            const {
                code,
            } = req.query;
            console.log(req.query)
            const payload = await googleAuthClient.getToken(code as string)
            console.log(payload)
            // const { credential, client_id } = req.body;
            // const redirectUrl = new URL('taskprio-app://googlelogin');
            // if (credential) redirectUrl.searchParams.append('credential', credential);
            // if (client_id) redirectUrl.searchParams.append('clientId', client_id);
            // res.redirect(302, redirectUrl.toString())
            res.status(200)
        }
    )

    router.get(
        `/accept_invitation`,
        async (req: Request, res: Response) => {
            const { invite_token } = req.query
            const redirectUrl = new URL('taskprio-app://accept_invitation')
            if (invite_token) redirectUrl.searchParams.append('invite_token', invite_token as string);
            res.redirect(302, redirectUrl.toString())
        }
    )

    router.post(
        `/accept_invitation`,
        async (req: Request, res: Response) => {
            const { invite_token } = req.query
            const redirectUrl = new URL('taskprio-app://accept_invitation')
            if (invite_token) redirectUrl.searchParams.append('invite_token', invite_token as string);
            res.redirect(302, redirectUrl.toString())
        }
    )

}

export default registerRedirectRoutes;
