import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createPostgrePool, getPostgrePool } from "./database/postgresql.js";
import reigsterAuthenticationRoutes from "./routes/authentication/authentication.js";
import cookieParser from "cookie-parser";
import registerProjectRoutes from "./routes/project/project.js";
import { authenticateRequestMiddleware } from "./middlewares/authentication.js";
import { registerWorkspaceRoutes } from "./routes/workspace/workspace.js";
import { registerTaskSectionRoutes } from "./routes/tasksection/tasksection.js";
import { registerTaskboardRoutes } from "./routes/taskboard/taskboard.js";
import { registerTaskRoutes } from "./routes/task/task.js";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { registerWebSocketLogic } from "./websocket/index.js";
import WebSocketConnectionsManager from "./websocket/connectionsManager.js";
import { OAuth2Client } from "google-auth-library";
import { Resend } from "resend";
import registerInvitationRoutes from "./routes/invitation/invitation.js";
dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY
const PORT = process.env.PORT || 5000;

export const APP = express();
export const resend = new Resend( resendApiKey )

// Google auth client
export const googleAuthClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
)

// Middleware for cors
APP.use(cors({
    origin : [ "http://localhost:5001" ],
    credentials: true,
}));
// Middleware to parse cookies
APP.use(cookieParser());
// Middleware to parse JSON bodies
APP.use(express.json());
APP.use(express.urlencoded({ extended : true }));

// Websocket server
export const SERVER = http.createServer(APP)
const wss = new WebSocketServer({ server : SERVER })
export const wsConnectionsManager = new WebSocketConnectionsManager( wss );

// Create the pool for postgre clients
createPostgrePool()

// Routes registration
APP.get( "/", ( req : Request, res : Response ) => {
    res.send( "Hello World" );
})
reigsterAuthenticationRoutes()

// Private routes
const privateRoutes = express.Router()
privateRoutes.use(authenticateRequestMiddleware)

// Workspace routes
const workspaceRoutes = express.Router()
registerWorkspaceRoutes(workspaceRoutes)

// Project routes
const projectRoutes = express.Router()
registerProjectRoutes(projectRoutes)

// Task board routes
const taskBoardRoutes = express.Router()
registerTaskboardRoutes(taskBoardRoutes)

// Task section routes
const taskSectionRoutes = express.Router()
registerTaskSectionRoutes(taskSectionRoutes)

// Task routes
const taskRoutes = express.Router()
registerTaskRoutes(taskRoutes)

// Invitation routes
const invitationRoutes = express.Router()
registerInvitationRoutes(invitationRoutes)

// Mount the private routes
privateRoutes.use("/workspace", workspaceRoutes)
privateRoutes.use("/project", projectRoutes)
privateRoutes.use("/taskboard", taskBoardRoutes)
privateRoutes.use("/tasksection", taskSectionRoutes)
privateRoutes.use("/task", taskRoutes)
privateRoutes.use("/invitation", invitationRoutes)
APP.use("/private", privateRoutes)

// Mount the websocket
registerWebSocketLogic(wss)

// Start the server
// APP.listen(PORT, () => {
//     console.log(` Server is running on port ${PORT} `)
// })
SERVER.listen(PORT, () => {
    console.log(` Server is running on port ${PORT} `)
})

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    // some other closing procedures go here
    SERVER.close( () => {   
        console.log( "Server closed" );
        process.exit(0);
    })
    setTimeout( () => {
        console.log( "Could not close server, forcefully shutting down" );
        process.exit(1);
    }, 10000 )
}
