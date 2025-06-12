export class NotWorkspaceMemberError extends Error {
    public statusCode : 403;
    constructor( message : string = "User is not a member of the workspace" ) {
        super(message);
        this.statusCode = 403;
    }
}