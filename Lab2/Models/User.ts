import jwt from "jsonwebtoken";

class User {
    login: string;
    password: string
    constructor(user?: User) {
        if(user) {
            this.login = user.login
            this.password = user.password
        } else {
            this.login = ''
            this.password = ''
        }
        
    }
    public IfUserIsAuthorized(authData: string, secret: string) : boolean {
        const token = authData?.split(' ')[1] ?? ''
        const payload = jwt.verify(token, secret)
        if (payload === this.login) {
            return true
        } else {
            return false
        }
    }
}
export default User