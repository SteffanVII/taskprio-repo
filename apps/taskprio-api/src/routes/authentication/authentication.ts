import { APP } from "../../app.js";
import { getPoolClient, getPostgrePool } from "../../database/postgresql.js";
import { hashPassword, verifyPassword } from "../../utilities/hashPassword.js";
import { IGoogleLoginRequest, ILoginRequest, IRegisterRequest } from "./interfaces.js";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyGoogleCredentialdMiddleware } from "../../middlewares/authentication.js";
import { getUserByEmail, getUserByGoogleUserIdKysely } from "../../database/queries/user/query.js";
import { createUser } from "../../database/queries/user/mutation.js";
import { TJWTPayload } from "../../middlewares/types.js";
import { configDotenv } from "dotenv";

configDotenv();

function reigsterAuthenticationRoutes() {

    APP.post(
        `/redirect-to-electron-app`,
        async ( req : Request, res : Response ) => {
            const { code, state } = req.query;
            console.log( code, state )
            const redirectUrl = new URL('taskprio-app://googlelogin');
            if (code) redirectUrl.searchParams.append('code', code.toString());
            if (state) redirectUrl.searchParams.append('state', state.toString());
            res.redirect(302, redirectUrl.toString())
        }
    )

    APP.post(
        "/login",
        async ( req : ILoginRequest, res : Response ) => {
            const { email, password, for_invitation_purpose } = req.body;

            if ( !email || !password ) {
                res.status(400).json({ message: "Email and password are required" });
            }
    
            try {

                const user = await getUserByEmail(email, false)
    
                if ( !user ) {
                    res.status(401).json({ message: "Email is not registered to any account" });
                } else {

                    const isPasswordValid = await verifyPassword(password, user.password_hashed);

                    if ( !isPasswordValid ) {
                        res.status(401).json({ message: "Invalid password" });
                    } else {
                        const accessToken = jwt.sign({ email : email, user_id : user.user_id }, process.env.JSONWEBTOKEN_SECRET);
                        res.cookie(
                            for_invitation_purpose ? process.env.INVITATION_ACCESS_TOKEN_COOKIE_NAME : process.env.ACCESS_TOKEN_COOKIE_NAME,
                            accessToken,
                            {
                                httpOnly : true,
                                secure : true,
                                sameSite : 'none',
                            }
                        )
                        res.status(200).json({ message: "Login successful", access_token : accessToken, user });
                    }
                }
            } catch (error) {   
                res.status(500).json({ message: "Internal server error" });
            }
        }
    );

    APP.post(
        "/login/google",
        // This middleware is used to verify the google credential.
        // It is used to add the user object to the request object
        verifyGoogleCredentialdMiddleware,
        async ( req : IGoogleLoginRequest, res : Response ) => {
            const { user, body } = req;

            if ( !user ) {
                res.status(400).json({ message : "Access token is required" });
                return
            }

            try {

                const existingUser = await getUserByGoogleUserIdKysely( user.google_user_id )

                if ( existingUser ) {
                    const accessToken = jwt.sign({
                        email : existingUser.email,
                        user_id : existingUser.user_id
                    }, process.env.JSONWEBTOKEN_SECRET);
                    res.cookie(
                        body.for_invitation_purpose ? process.env.INVITATION_ACCESS_TOKEN_COOKIE_NAME : process.env.ACCESS_TOKEN_COOKIE_NAME,
                        accessToken,
                        {
                            httpOnly : true,
                            sameSite : "none",
                            secure : true,
                            maxAge: 1000 * 60 * 60 * 24   
                        }
                    )

                    res.status(200).json({ message : "Login successful", access_token : accessToken, user : existingUser });

                } else {

                    const createdUser = await createUser({
                        email : user.email,
                        firstname : user.given_name,
                        lastname : user.family_name,
                        google_user_id : user.google_user_id,
                        password_hashed : null
                    })

                    const accessToken = jwt.sign({
                        email : createdUser.email,
                        user_id : createdUser.user_id
                    }, process.env.JSONWEBTOKEN_SECRET);

                    res.cookie(
                        body.for_invitation_purpose ? process.env.INVITATION_ACCESS_TOKEN_COOKIE_NAME : process.env.ACCESS_TOKEN_COOKIE_NAME,
                        accessToken,
                        {
                            httpOnly : true,
                            sameSite : "none",
                            secure : true
                        }
                    )

                    const userObject = await getUserByEmail(createdUser.email)

                    res.status(201).json({ message : "Login successful", access_token : accessToken, user : userObject });
                }

            } catch (error) {
                console.error(error);
                res.status(500).json({ message : "Internal server error" });
            }
            
        }
    )

    APP.post(
        "/register",
        async ( req : IRegisterRequest, res : Response ) => {

            const { email, password, firstname, lastname, for_invitation_purpose } = req.body || {};

            if ( !email || !password || !firstname || !lastname ) {
                res.status(400).json({ message: "Email, password, firstname and lastname are required" });
                return
            }

            const {
                client,
                release
            } = await getPoolClient();

            try {

                await client.query("BEGIN")

                const existingUser = await getUserByEmail(email, true)

                if ( existingUser ) {
                    res.status(400).json({ message: "This email is already in use" });
                    client.release();
                    return;
                }

                const hashedPassword = await hashPassword(password);

                const createUserResult = await client.query({
                    text : ` INSERT INTO public."user" (email, password_hashed, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING user_id, email, firstname, lastname `,
                    values : [email, hashedPassword, firstname, lastname]
                })
                
                if ( createUserResult.rowCount === 1 ) {
                    const accessToken = jwt.sign({ email : email, user_id : createUserResult.rows[0].user_id }, process.env.JSONWEBTOKEN_SECRET);
                    const userObject = await getUserByEmail(email)
                    res.status(201)
                        .cookie(
                            for_invitation_purpose ? process.env.INVITATION_ACCESS_TOKEN_COOKIE_NAME : process.env.ACCESS_TOKEN_COOKIE_NAME,
                            accessToken,
                            {
                                httpOnly : true,
                                sameSite : "none",
                                secure : true
                            }
                        )
                        .json({ message: "User created successfully", access_token : accessToken, user : userObject });
                } else {
                    res.status(500).json({ message: "Failed to create user" });
                }

                await client.query("COMMIT")

            } catch (error) {
                console.log(error);
                await client.query("ROLLBACK")
                res.status(500).json({ message: "Internal server error" });
            } finally {
                release()
            }

        }
    )

    APP.post(
        `/auth`,
        async ( req : Request, res : Response ) => {

            const accessToken = req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME];

            if ( !accessToken ) {
                res.status(401).json({ message : "Unauthorized" });
                return;
            }

            try {

                const decodedToken = jwt.verify(accessToken, process.env.JSONWEBTOKEN_SECRET) as TJWTPayload;

                const user = await getUserByEmail(decodedToken.email);

                if ( !user ) {
                    res.status(401).json({ message : "Unauthorized" });
                    return;
                }

                res.status(200).json({ message : "Authenticated", user });

            } catch (error) {
                res.status(401).json({ message : "Unauthorized" });
            }
        }
    )

    APP.post(
        `/logout`,
        async ( _req : Request, res : Response ) => {
            res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME).status(200).json({ message : "Logged out" });
        }
    )

}

export default reigsterAuthenticationRoutes;
