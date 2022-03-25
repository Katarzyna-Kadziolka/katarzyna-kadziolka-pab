class Tag {
    id?: number;
    name: string;

    constructor(tag: Tag) {
        this.id = tag.id;
        this.name = tag.name;
    }
}

export default Tag;