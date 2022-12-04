import { FilterQuery } from 'mongoose';
import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Paginator } from '../Repository/repository-mongodb-types';
import { SearchPaginationMongooseModel } from '../Repository/repository-mongoose-type';



export function repositoryPlugin(schema: Schema, options: any): void {
    schema.static("readAllPagination", async function readAll(filter?: FilterQuery<Partial<Schema>>, sortBy = "_id", sortDirection: 1 | -1 = 1): Promise<Schema[]> {
        if (filter) {
            return (await this
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .lean())
                .map((elem: any) => {
                    const { _id, ...other } = elem
                    return { id: _id.toString(), ...other } as unknown as Schema
                })
        }

        return (await this
            .find()
            .sort({ [sortBy]: sortDirection })
            .lean())
            .map((elem: any) => {
                const { _id, ...other
                } = elem
                return { id: _id.toString(), ...other } as unknown as Schema
            })
    })
    schema.static("readCount", async function readCount(filter?: FilterQuery<Partial<Schema>>) {
        if (filter) return await this.countDocuments(filter)
        return await this.countDocuments()
    })
    schema.static("readAllOrByPropPaginationSort", async function readAllOrByPropPaginationSort(this:any, data: SearchPaginationMongooseModel<Schema>): Promise<Paginator<Schema>> {
        const { pageNumber, pageSize, sortBy, sortDirection, filter } = data
        const setPaginator = async (items: any) => {
            const count = await this.readCount(filter)
            const result: Paginator<any> = {
                "pagesCount": Math.ceil(count / pageSize),
                "page": pageNumber,
                "pageSize": pageSize,
                "totalCount": count,
                items
            }
            return result
        }

        if (filter) {
            const items = (await this
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort({ [sortBy]: sortDirection })
                .lean())
                .map((elem: any) => {
                    const { _id, ...other } = elem
                    return { id: _id.toString(), ...other }
                })
            const result = setPaginator(items)

            return result
        }
        const items = (await this
            .find()
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .lean())
            .map((elem: any) => {
                const { _id, ...other } = elem
                return { id: _id.toString(), ...other }
            })
        const result = setPaginator(items)

        return result
    })
    schema.static("readAllOrByPropPaginationSort", async function readOne(id: string): Promise < Schema > {
        const result: any = await this.findOne({ _id: new ObjectId(id) }).lean()
            if(!result) return result
            const { _id, ...other } = result
            return { id: _id.toString(), ...other }
    })
    schema.static("readAllOrByPropPaginationSort", async function createOne(element: Omit<Schema, "id">): Promise < string > {
        const objectId: any = (await this.create(element))._id
            const id = objectId.toString()
            // if (result) return id
            return id
    })
    schema.static("readAllOrByPropPaginationSort", async function updateOne(id: string, data: Partial<Schema>) {
        const result:any = await this.updateOne({ _id: new ObjectId(id) }, { $set: data })
        return result.modifiedCount === 1
    })
    schema.static("readAllOrByPropPaginationSort", async function replaceOne(id: string, element: Schema) {
        const result:any = await this.replaceOne({ _id: new ObjectId(id) }, element)
        return result.modifiedCount === 1
    })
    schema.static("readAllOrByPropPaginationSort", async function replaceOne(id: string, element: Schema) {
        const result:any = await this.replaceOne({ _id: new ObjectId(id) }, element)
        return result.modifiedCount === 1
    })
    schema.static("readAllOrByPropPaginationSort", async function deleteOne(id: string) {
        const result:any = await this.deleteOne({ _id: new ObjectId(id) })
        return result.deletedCount === 1
    })
    schema.static("readAllOrByPropPaginationSort", async function deleteAll() {
        const result:any = await this.deleteMany({})
        return result.acknowledged
    })
}


