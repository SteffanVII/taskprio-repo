import slugify from "slugify";
import { APP } from "../../app.js";
import { getPoolClient, getPostgrePool } from "../../database/postgresql.js";
import { hashPassword, verifyPassword } from "../../utilities/hashPassword.js";
import { IGoogleLoginRequest, ILoginRequest, IRegisterRequest } from "./interfaces.js";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import https from "https";
import axios from "axios";
import { verifyGoogleCredentialdMiddleware } from "../../middlewares/authentication.js";
import { getUserByEmail, getUserByGoogleUserId } from "../../database/queries/user/query.js";
import { createUser } from "../../database/queries/user/mutation.js";
import { TJWTPayload } from "../../middlewares/types.js";

function reigsterAuthenticationRoutes() {

    APP.post(
        "/login",
        async ( req : ILoginRequest, res : Response ) => {
            const { email, password } = req.body;

            if ( !email || !password ) {
                res.status(400).json({ message: "Email and password are required" });
            }
    
            try {
                const client = await getPostgrePool().connect();
                
                // Check if the user exists
                const result = await client.query(
                    `SELECT * FROM public."user" WHERE email = $1`,
                    [email]
                );
    
                if ( result.rows.length === 0 ) {
                    res.status(401).json({ message: "Email is not registered to any account" });
                } else {

                    const isPasswordValid = await verifyPassword(password, result.rows[0].password_hashed);

                    if ( !isPasswordValid ) {
                        res.status(401).json({ message: "Invalid password" });
                    } else {
                        const accessToken = jwt.sign({ email : email, user_id : result.rows[0].user_id }, process.env.JSONWEBTOKEN_SECRET);
                        res.cookie(
                            "access_token",
                            accessToken,
                            {
                                httpOnly : true,
                                secure : true,
                                sameSite : 'none',
                            }
                        )
                        res.status(200).json({ message: "Login successful", access_token : accessToken });
                    }
                }
                client.release();
            } catch (error) {   
                res.status(500).json({ message: "Internal server error" });
            }
        }
    );

    APP.post(
        "/login/google",
        verifyGoogleCredentialdMiddleware,
        async ( req : IGoogleLoginRequest, res : Response ) => {
            const { user } = req;

            if ( !user ) {
                res.status(400).json({ message : "Access token is required" });
                return
            }

            try {

                const existingUser = await getUserByGoogleUserId( user.google_user_id )

                if ( existingUser ) {
                    const accessToken = jwt.sign({
                        email : existingUser.email,
                        user_id : existingUser.user_id
                    }, process.env.JSONWEBTOKEN_SECRET);
                    res.cookie(
                        "accessToken",
                        accessToken,
                        {
                            httpOnly : true,
                            sameSite : "none",
                            secure : true,
                            maxAge: 1000 * 60 * 60 * 24   
                        }
                    )
                    res.status(200).json({ message : "Login successful", access_token : accessToken });
                } else {
                    const createdUser = await createUser({
                        email : user.email,
                        firstname : user.given_name,
                        lastname : user.family_name,
                        google_user_id : user.google_user_id
                    })


                    const accessToken = jwt.sign({
                        email : createdUser.email,
                        user_id : createdUser.user_id
                    }, process.env.JSONWEBTOKEN_SECRET);
                    res.cookie(
                        "accessToken",
                        accessToken,
                        {
                            httpOnly : true,
                            sameSite : "lax",
                            secure : true
                        }
                    )
                    res.status(201).json({ message : "Login successful", access_token : accessToken });
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

            const { email, password, firstname, lastname } = req.body || {};

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

                const findUserResult = await client.query({
                    text : `SELECT * FROM public."user" WHERE email = $1`,
                    values : [email]
                })

                if ( findUserResult.rowCount > 0 ) {
                    console.log( `Register failed : ${Date.now()}` );
                    res.status(400).json({ message: "This email is already in use" });
                    client.release();
                    return;
                }

                const hashedPassword = await hashPassword(password);

                const createUserResult = await client.query({
                    text : ` INSERT INTO public."user" (email, password_hashed, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING user_id, email, firstname, lastname `,
                    values : [email, hashedPassword, firstname, lastname]
                })
                
                await client.query("COMMIT")
                
                if ( createUserResult.rowCount === 1) {
                    console.log( `Register success : ${Date.now()}` );
                    const accessToken = jwt.sign({ email : email, user_id : createUserResult.rows[0].user_id }, process.env.JSONWEBTOKEN_SECRET);
                    res.status(201).json({ message: "User created successfully", access_token : accessToken });
                } else {
                    console.log( `Register failed : ${Date.now()}` );
                    res.status(500).json({ message: "Failed to create user" });
                }
                

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

            const accessToken = req.cookies["accessToken"];

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

                res.status(200).json({ message : "Authenticated" });

            } catch (error) {
                res.status(401).json({ message : "Unauthorized" });
            }
        }
    )

    APP.post(
        `/logout`,
        async ( _req : Request, res : Response ) => {
            res.clearCookie("accessToken").status(200).json({ message : "Logged out" });
        }
    )

}

export default reigsterAuthenticationRoutes;
