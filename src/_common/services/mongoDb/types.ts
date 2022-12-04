import { Filter } from "mongodb"
import { IObject } from "../../types/types"

export interface AdapterType {
    readAll(collectionName: string, filter?: Filter<IObject>, sortBy?: string, sortDirection?: number): any
    readAllOrByPropPaginationSort(collectionName: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 1 | -1, filter?: Filter<IObject>): any
    readCount(collectionName: string, filter?: Filter<IObject>): any
    readOne(collectionName: string, id: string): any
    createOne(collectionName: string, element: IObject): any
    updateOne(collectionName: string, id: string, data: IObject): any
    replaceOne(collectionName: string, id: string, data: IObject): any
    deleteOne(collectionName: string, id: string): any
    deleteAll(collectionName: string): any
}
export interface AdapterSetupType {
    then(resolve: any, reject: any): Promise<void>
    connect(): any
    ping(): any
    disconnect(): any
    reConnect(): any
}
