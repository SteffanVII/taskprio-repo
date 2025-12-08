import WebSocket from "ws"
import { EWebsocketConnectionType } from "./connectionsManager.ts";

declare module "ws" {
    interface WebSocket {
        user_id : string;
        client_id : string;
        connection_type? : EWebsocketConnectionType;
    }
}