import Note from "./Note";
import Tag from "./Tag";

class Data {
    notes: Note[] = []
    tags: Tag[] = []
    constructor(data?: Data) {
        if (data) {
            this.notes = data.notes,
            this.tags = data.tags
        }
        
    }
}

export default Data