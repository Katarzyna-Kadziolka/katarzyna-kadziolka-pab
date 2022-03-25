import fs from 'fs';

class Repository {

    public async readStorage(): Promise<string> {
        try {
            return await fs.promises.readFile('storeFile.txt', 'utf-8');
        } catch (err) {
            console.log(err)
        }
    }
    public async updateStorage(dataToSave: string): Promise<void> {
        try {
            await fs.promises.writeFile('storeFile.txt', dataToSave);
        } catch (err) {
            console.log(err)
        }
    }
}

export default Repository