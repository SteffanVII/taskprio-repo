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

// // Graceful shutdown handling
// const gracefulShutdown = async (signal: string) => {
//     console.log(`\n${signal} received. Starting graceful shutdown...`);
    
//     // Set a timeout to force exit if graceful shutdown takes too long
//     const forceExitTimeout = setTimeout(() => {
//         console.error('Forced exit due to timeout');
//         process.exit(1);
//     }, 5000); // Reduced to 5 seconds timeout

//     try {
//         // Immediately stop accepting new connections
//         SERVER.on('request', (req, res) => {
//             res.writeHead(503, { 'Connection': 'close' });
//             res.end('Server is shutting down');
//         });

//         // Close all WebSocket connections first
//         console.log('Closing WebSocket connections...');
//         const closePromises = Array.from(wss.clients).map(client => {
//             return new Promise<void>((resolve) => {
//                 if (client.readyState === WebSocket.OPEN) {
//                     client.close(1000, 'Server shutting down');
//                 }
//                 resolve();
//             });
//         });
        
//         await Promise.all(closePromises);
        
//         // Close WebSocket server
//         await new Promise<void>((resolve) => {
//             wss.close(() => {
//                 console.log('WebSocket server closed');
//                 resolve();
//             });
//         });

//         // Close the HTTP server with a timeout
//         await Promise.race([
//             new Promise<void>((resolve, reject) => {
//                 SERVER.close((err) => {
//                     if (err) {
//                         console.error('Error closing server:', err);
//                         reject(err);
//                     } else {
//                         console.log('HTTP server closed');
//                         resolve();
//                     }
//                 });
//             }),
//             new Promise((_, reject) => 
//                 setTimeout(() => reject(new Error('Server close timeout')), 2000)
//             )
//         ]);

//         // Close database pool
//         const pool = getPostgrePool();
//         if (pool) {
//             console.log('Closing database pool...');
//             await pool.end();
//             console.log('Database pool closed');
//         }

//         clearTimeout(forceExitTimeout);
//         console.log('Graceful shutdown completed');
        
//         // Force exit after a short delay to ensure all cleanup is done
//         setTimeout(() => {
//             process.exit(0);
//         }, 100);
//     } catch (error) {
//         console.error('Error during graceful shutdown:', error);
//         clearTimeout(forceExitTimeout);
//         // Force exit immediately on error
//         process.exit(1);
//     }
// };

// // Handle different termination signals
// process.on('SIGINT', () => {
//     console.log('SIGINT received');
//     gracefulShutdown('SIGINT');
// });   // Ctrl+C

// process.on('SIGTERM', () => {
//     console.log('SIGTERM received');
//     gracefulShutdown('SIGTERM');
// }); // Termination signal

// // Remove SIGUSR2 handler as it's not needed for Windows
// // process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

// // Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//     console.error('Uncaught Exception:', error);
//     gracefulShutdown('uncaughtException');
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//     gracefulShutdown('unhandledRejection');
// });