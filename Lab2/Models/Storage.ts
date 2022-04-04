import Note from "./Note";
import Tag from "./Tag";
import User from "./User";

class Storage {
    notes: Note[] = []
    tags: Tag[] = []
    users: User[] = []
    constructor(data?: Storage) {
        if (data) {
            this.notes = data.notes
            this.tags = data.tags
            this.users = data.users
        }
        
    }
}

export default Storage