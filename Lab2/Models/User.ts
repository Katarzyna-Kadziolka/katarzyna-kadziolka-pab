import jwt from "jsonwebtoken";

class User {
    id?: number;
    login: string;
    password: string
    notesIds: number[];
    tagsIds: number[];

    constructor(user?: User) {
        if(user) {
            this.login = user.login
            this.password = user.password
            this.notesIds = user.notesIds
            this.tagsIds = user.tagsIds
        } else {
            this.login = ''
            this.password = ''
            this.notesIds = []
            this.tagsIds = []
        }
        
    }
    public IfUserIsAuthorized(authData: string, secret: string) : boolean {
        const token = authData?.split(' ')[1] ?? ''
        const payload = jwt.verify(token, secret)
        let checkValue = ''
        if (this.id) {
            checkValue = this.id.toString() ?? ''
        }
        if (this.id && payload === checkValue) {
            return true
        } else {
            return false
        }
    }
}
export default User