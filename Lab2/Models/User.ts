
class User {
    id?: number;
    login: string;
    password: string;
    role: string;
    notesIds: number[];
    tagsIds: number[];

    constructor(user?: User) {
        if(user) {
            this.login = user.login
            this.password = user.password
            this.notesIds = user.notesIds
            this.tagsIds = user.tagsIds
            this.role = user.role
        } else {
            this.login = ''
            this.password = ''
            this.notesIds = []
            this.tagsIds = []
            this.role = 'user'
        }
        
    }
    
}
export default User