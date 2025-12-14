import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createPostgrePool, getPostgrePool, testDatabaseConnection } from "./database/postgresql.js";
import reigsterAuthenticationRoutes from "./routes/authentication/authentication.js";
import cookieParser from "cookie-parser";
import registerProjectRoutes from "./routes/project/project.js";
import { authenticateRequestMiddleware, verifyProjectMemberMiddleware } from "./middlewares/authentication.js";
import { registerWorkspaceRoutes } from "./routes/workspace/workspace.js";
import { registerTaskSectionRoutes } from "./routes/tasksection/tasksection.js";
import { registerTaskboardRoutes } from "./routes/taskboard/taskboard.js";
import { registerTaskRoutes } from "./routes/task/task.js";
import http from "http";
import { WebSocketServer } from "ws";
import { registerWebSocketLogic } from "./websocket/index.js";
import { WebSocketConnectionsManagerSimple } from "./websocket/connectionsManager.js";
import { OAuth2Client } from "google-auth-library";
import { Resend } from "resend";
import { registerInvitationPrivateRoutes, registerInvitationPublicRoutes } from "./routes/invitation/invitation.js";
import { registerTagRoutes } from "./routes/tag/tag.js";
import { createTaskprioKyselyConnection } from "./database/kysely/kysely.js";
import { initAWSS3, testAWSS3Connection } from "./aws/index.js";
import { registerProfileRoutes } from "./routes/profile/profile.js";
import multer from "multer";
import { registerToDoRoutes } from "./routes/todo/todo.js";
import { initializeTaskTodoTimerHeartbeatTimeouts } from "./initializers/taskTodoTimerHeartbeatTimeoutManager.js";
import { IAuthenticatedRequest } from "./middlewares/interfaces.js";

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
    origin : [ "http://localhost:5001", "https://taskprio-webapp.onrender.com", "*" ],
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
// export const wsConnectionsManager = new WebSocketConnectionsManager( wss );
export const wsConnectionsManagerSimple = new WebSocketConnectionsManagerSimple( wss )

// Create the pool for postgre clients
createPostgrePool()
await testDatabaseConnection()
await createTaskprioKyselyConnection()

// Initialize AWS S3
initAWSS3()
await testAWSS3Connection()

// Mount the websocket
registerWebSocketLogic(wss, wsConnectionsManagerSimple)

// // Connect to redis
// redisConnect()

// Initialize multer
export const multerInstance = multer({
    storage : multer.memoryStorage()
})

// Initializations
await initializeTaskTodoTimerHeartbeatTimeouts()

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
registerTaskRoutes(taskRoutes, wsConnectionsManagerSimple)

// Invitation private routes
const invitationRoutes = express.Router()
registerInvitationPrivateRoutes(invitationRoutes)

// Invitation public routes
const invitationPublicRoutes = express.Router()
registerInvitationPublicRoutes(invitationPublicRoutes)

// Tag routes
const tagRoutes = express.Router()
registerTagRoutes(tagRoutes)

// Profile routes
const profileRoutes = express.Router()
registerProfileRoutes(profileRoutes)

// Todo routes
const toDoRoutes = express.Router()
registerToDoRoutes(toDoRoutes)

// Mount the private routes
privateRoutes.post("/ping", async ( _req : IAuthenticatedRequest, res : Response ) => {
    res.status(200).json({ message : "Pong" })
})
privateRoutes.use("/workspace", workspaceRoutes)
privateRoutes.use("/project", projectRoutes)
privateRoutes.use("/taskboard", taskBoardRoutes)
privateRoutes.use("/tasksection", taskSectionRoutes)
privateRoutes.use("/task", taskRoutes)
privateRoutes.use("/invitation", invitationRoutes)
privateRoutes.use("/tag", tagRoutes)
privateRoutes.use("/profile", profileRoutes)
privateRoutes.use("/todo", toDoRoutes)
APP.use("/private", privateRoutes)
APP.use("/invitation", invitationPublicRoutes)

// Start the server
SERVER.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`)
})

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

async function gracefulShutdown() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );

    // Close websocket connections
    wss.clients.forEach( client => {
        client.close()
    } )
    wss.close()

    // Close postgre pool
    await getPostgrePool()?.end()

    SERVER.close( () => {   
        console.log( "Server closed" );
        process.exit(0);
    })

    SERVER.closeAllConnections()

    setTimeout( () => {
        console.log( "Could not close server, forcefully shutting down" );
        process.exit(1);
    }, 10000 )
}
