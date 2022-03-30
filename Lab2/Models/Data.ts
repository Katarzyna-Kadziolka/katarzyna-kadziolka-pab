import Note from "./Note";
import Tag from "./Tag";

class Storage {
    notes: Note[] = []
    tags: Tag[] = []
    constructor(data?: Storage) {
        if (data) {
            this.notes = data.notes,
            this.tags = data.tags
        }
        
    }
}

export default Storage