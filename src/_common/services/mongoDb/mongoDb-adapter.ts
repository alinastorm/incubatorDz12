import { Collection, Document, ObjectId, Filter } from 'mongodb'
import { Paginator } from '../../abstractions/Repository/repository-mongodb-types';
import { IObject } from '../../types/types';
import { AdapterType } from './types';
import mongoDbClient from "./mongoDbClient"
// // Connection URL
// const urlMongo = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'
// const clientMongo = new MongoClient(urlMongo)
// // Database Name
// const dbName = process.env.mongoDbName || 'learning';
// const database = clientMongo.db(dbName);

class DbMongoService implements AdapterType {


    async readAll(collectionName: string, filter?: Filter<IObject>, sortBy = "_id", sortDirection: 1 | -1 = 1) {

        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)

        if (filter) {
            return (await collection
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .toArray())
                .map((elem) => {
                    const { _id, ...other } = elem
                    return { id: _id.toString(), ...other }
                })
        }

        return (await collection
            .find()
            .sort({ [sortBy]: sortDirection })
            .toArray())
            .map((elem) => {
                const { _id, ...other
                } = elem
                return { id: _id.toString(), ...other }
            })
    }
    async readCount(collectionName: string, filter?: Filter<IObject>) {
        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        if (filter) return await collection.countDocuments(filter)
        return await collection.countDocuments()


    }
    async readAllOrByPropPaginationSort(collectionName: string, pageNumber: number, pageSize: number, sortBy: string, sortDirection: 1 | -1, filter?: Filter<IObject>) {

        const setPaginator = async (items: any) => {
            const count = await this.readCount(collectionName, filter)
            const result: Paginator<any> = {
                "pagesCount": Math.ceil(count / pageSize),
                "page": pageNumber,
                "pageSize": pageSize,
                "totalCount": count,
                items
            }
            return result
        }


        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        if (filter) {
            const items = (await collection
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort({ [sortBy]: sortDirection })
                .toArray())
                .map((elem) => {
                    const { _id, ...other } = elem
                    return { id: _id.toString(), ...other }
                })
            const result = setPaginator(items)

            return result
        }
        const items = (await collection
            .find()
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .toArray())
            .map((elem) => {
                const { _id, ...other } = elem
                return { id: _id.toString(), ...other }
            })
        const result = setPaginator(items)

        return result
    }
    async readOne(collectionName: string, id: string) {
        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        const result: any = await collection.findOne({ _id: new ObjectId(id) })
        if (!result) return result
        const { _id, ...other } = result
        return { id: _id.toString(), ...other }
    }
    async createOne(collectionName: string, element: Document) {
        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        // const id = uuidv4()
        // element.id = id
        const result = (await collection.insertOne(element)).insertedId.toString()
        // if (result) return id
        return result
    }
    async updateOne(collectionName: string, id: string, data: any) {
        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: data })
        return result.modifiedCount === 1
    }
    async replaceOne(collectionName: string, id: string, element: IObject) {
        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        const result = await collection.replaceOne({ _id: new ObjectId(id) }, element)
        return result.modifiedCount === 1
    }
    async deleteOne(collectionName: string, id: string) {
        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        const result = await collection.deleteOne({ _id: new ObjectId(id) })
        return result.deletedCount === 1
    }
    async deleteAll(collectionName: string) {
        const collection: Collection<Document> = mongoDbClient.database.collection(collectionName)
        const result = await collection.deleteMany({})
        return result.acknowledged
    }
}

export default new DbMongoService()
