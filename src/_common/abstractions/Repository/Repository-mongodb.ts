import { IObject } from '../../types/types';
import { Filter } from 'mongodb';
import { AdapterType } from '../../services/mongoDb/types';
import { Paginator, SearchPaginationMongoDbModel } from './repository-mongodb-types';

// const dataService = new DataService(mongoDbAdapter)


export class RepositoryMongoDb <T extends IObject>{

    constructor(private collectionName: string, private dataService: AdapterType) { }

    async readAll(filter?: Filter<Partial<T>>) {
        const result: T[] = await this.dataService.readAll(this.collectionName, filter)
        return result
    }
    async readAllOrByPropPaginationSort(data: SearchPaginationMongoDbModel ) {
        const { pageNumber, pageSize, sortBy, sortDirection, filter } = data 
        const result: Paginator<T> = await this.dataService.readAllOrByPropPaginationSort(this.collectionName, pageNumber, pageSize, sortBy, sortDirection, filter)
        return result
    }
    async readOne(id: string) {
        const result: T | null = await this.dataService.readOne(this.collectionName, id)
        return result
    }
    async createOne(element: Omit<T, "id">): Promise<string> {
        return await this.dataService.createOne(this.collectionName, element)
    }
    async updateOne(id: string, data: Partial<T>) {
        const result: boolean = await this.dataService.updateOne(this.collectionName, id, data)
        return result
    }
    async replaceOne(id: string, data: T) {
        const result = await this.dataService.replaceOne(this.collectionName, id, data)
        return result
    }
    async deleteOne(id: string): Promise<boolean> {
        return await this.dataService.deleteOne(this.collectionName, id)
    }
    async deleteAll(): Promise<boolean> {
        const result = await this.dataService.deleteAll(this.collectionName)
        return result
    }
}

