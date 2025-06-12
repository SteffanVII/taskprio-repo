import WebSocket from "ws"

declare module "ws" {
    interface WebSocket {
        user_id : string;        
    }
}