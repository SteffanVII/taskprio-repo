export class NotProjectMemberError extends Error {
    public statusCode : number;
    constructor( message : string = "User is not a member of the project" ) {
        super(message);
        this.statusCode = 403;
    }
}