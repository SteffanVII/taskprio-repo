import { Request, Response, Router } from "express";
import { googleAuthClient, googleTokensStore, TGoogleTokens } from "../../app.js";
import { v4 as uuidV4 } from "uuid";

function registerRedirectRoutes(router: Router) {

    router.get(
        `/google_login`,
        async (req: Request, res: Response) => {
            const {
                code,
            } = req.query;
            const { tokens, res: response } = await googleAuthClient.getToken(code as string)
            console.log(response.data);
            const proofKey = uuidV4()
            googleTokensStore.set(proofKey, tokens as TGoogleTokens)
            const redirectUrl = new URL('taskprio-app://googlelogin');
            redirectUrl.searchParams.append('proof_key', proofKey);
            redirectUrl.searchParams.append('client_id', response.data.client_id);
            res.redirect(302, redirectUrl.toString())
        }
    )

    router.post(
        `/google_login`,
        async (req: Request, res: Response) => {
            const {
                code,
            } = req.query;
            const { tokens, res: response } = await googleAuthClient.getToken(code as string)
            console.log(response.data);
            const proofKey = uuidV4()
            googleTokensStore.set(proofKey, tokens as TGoogleTokens)
            const redirectUrl = new URL('taskprio-app://googlelogin');
            redirectUrl.searchParams.append('proof_key', proofKey);
            redirectUrl.searchParams.append('client_id', response.data.client_id);
            res.redirect(302, redirectUrl.toString())
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
