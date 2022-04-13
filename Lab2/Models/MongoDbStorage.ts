class MongoDbStorage implements IStorage {
    readStorage(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    updateStorage(dataToSave: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}