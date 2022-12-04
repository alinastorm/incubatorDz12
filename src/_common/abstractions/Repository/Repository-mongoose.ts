import { ObjectId } from 'mongodb';
import { FilterQuery, Model, Document } from 'mongoose';
import { IObject } from '../../types/types';
import { Paginator } from './repository-mongodb-types';
import { SearchPaginationMongooseModel } from './repository-mongoose-type';

//class extends Model нужен так как this в методе требует контекст Model при подключении метода 
export class RepositoryMongoose extends Model {
    // Пример:
    // //this:... требует контекст
    // static async methodClass<T extends IObject>(this: Model<T>, filter?: FilterQuery<Partial<T>>, sortBy = "_id", sortDirection: 1 | -1 = 1): Promise<T[]> {
    //     if (filter) {
    //         return (await this
    //             .find(filter)
    //             .sort({ [sortBy]: sortDirection })
    //             .lean())
    //             .map((elem: any) => {
    //                 const { _id, ...other } = elem
    //                 return { id: _id.toString(), ...other }
    //             })
    //     }

    //     return (await this
    //         .find()
    //         .sort({ [sortBy]: sortDirection })
    //         .lean())
    //         .map((elem: any) => {
    //             const { _id, ...other } = elem
    //             return { id: _id.toString(), ...other }
    //         })
    // }
    // //this:... требует контекст
    // async methodInstance<T extends IObject>(this: Document<T>, filter?: FilterQuery<Partial<T>>, sortBy = "_id", sortDirection: 1 | -1 = 1) {
    // }
    static async repositoryReadAll<T>(filter?: FilterQuery<Partial<T>>, sortBy = "_id", sortDirection: 1 | -1 = 1): Promise<T[]> {
        if (filter) {
            return (await this
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .lean())
                .map((elem) => {
                    const { _id, ...other } = elem
                    return { id: _id.toString(), ...other } as unknown as T
                })
        }

        return (await this
            .find()
            .sort({ [sortBy]: sortDirection })
            .lean())
            .map((elem) => {
                const { _id, ...other
                } = elem
                return { id: _id.toString(), ...other } as unknown as T
            })
    }
    static async repositoryReadAllOrByPropPaginationSort<T>(data: SearchPaginationMongooseModel<T>): Promise<Paginator<T>> {
        const { pageNumber, pageSize, sortBy, sortDirection, filter } = data
        const setPaginator = async (items: any) => {
            const count = filter ? await this.countDocuments(filter) : await this.countDocuments()
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
                .map((elem) => {
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
            .map((elem) => {
                const { _id, ...other } = elem
                return { id: _id.toString(), ...other }
            })
        const result = setPaginator(items)

        return result
    }
    static async repositoryReadOne<T>(id: string): Promise<T> {
        const result: any = await this.findOne({ _id: new ObjectId(id) }).lean()
        if (!result) return result
        const { _id, ...other } = result
        return { id: _id.toString(), ...other }
    }
    static async repositoryCreateOne<T>(element: Omit<T, "id">): Promise<string> {
        const objectId: ObjectId = (await this.create(element))._id
        const id = objectId.toString()
        // if (result) return id
        return id
    }
    static async repositoryUpdateOne<T>(id: string, data: Partial<T>) {
        const result = await this.updateOne({ _id: new ObjectId(id) }, { $set: data })
        return result.modifiedCount === 1
    }
    static async repositoryReplaceOne<T>(id: string, element: T) {
        const result = await this.replaceOne({ _id: new ObjectId(id) }, element)
        return result.modifiedCount === 1
    }
    static async repositoryDeleteOne(id: string) {
        const result = await this.deleteOne({ _id: new ObjectId(id) })
        return result.deletedCount === 1
    }
    static async repositoryDeleteAll() {
        const result = await this.deleteMany({})
        return result.acknowledged
    }
}


