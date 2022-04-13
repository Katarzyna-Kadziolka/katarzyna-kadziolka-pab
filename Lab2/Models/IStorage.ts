interface IStorage {
    readStorage(): Promise<string>
    updateStorage(dataToSave: string): Promise<void>
}