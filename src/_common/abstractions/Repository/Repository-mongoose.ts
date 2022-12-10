import { ObjectId } from 'mongodb';
import { FilterQuery, Model, Schema, Document, LeanDocumentOrArray, LeanDocument, QueryWithHelpers, HydratedDocumentFromSchema, HydratedDocument } from 'mongoose';
import { IObject } from '../../types/types';
import { Paginator } from './repository-mongodb-types';
import { SearchPaginationMongooseModel } from './repository-mongoose-type';

//class extends Model нужен так как this в методе требует контекст Model при подключении метода 
export class RepositoryMongoose {
    // Пример:
    // //this:... требует контекст
    // static async methodClass<T extends IObject>(this: Model<T>, filter?: FilterQuery<Partial<T>>, sortBy = "_id", sortDirection: 1 | -1 = 1): Promise<T[]> {
    //     if (filter) {
    //         return (await this
    //             .find(filter)
    //             .sort({ [sortBy]: sortDirection })
    //             .lean({ virtuals: true }))
    //             .map((elem: any) => {
    //                 const { _id, ...other } = elem
    //                 return { id: _id.toString(), ...other }
    //             })
    //     }

    //     return (await this
    //         .find()
    //         .sort({ [sortBy]: sortDirection })
    //         .lean({ virtuals: true }))
    //         .map((elem: any) => {
    //             const { _id, ...other } = elem
    //             return { id: _id.toString(), ...other }
    //         })
    // }
    // //this:... требует контекст
    // async methodInstance<T extends IObject>(this: Document<T>, filter?: FilterQuery<Partial<T>>, sortBy = "_id", sortDirection: 1 | -1 = 1) {
    // }
    static async repositoryReadAll<T>(this: Model<any>, filter?: FilterQuery<Partial<T>>, sortBy = "_id", sortDirection: 1 | -1 = 1): Promise<T[]> {
        if (filter) {
            return (await this
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .lean({ virtuals: true }))
                .map((elem) => {
                    const { _id, ...other } = elem
                    return { id: _id.toString(), ...other } as unknown as T
                })
        }

        return (await this
            .find()
            .sort({ [sortBy]: sortDirection })
            .lean({ virtuals: true }))
            .map((elem) => {
                const { _id, ...other
                } = elem
                return { id: _id.toString(), ...other } as unknown as T
            })
    }
    static async repositoryReadAllOrByPropPaginationSort<T>(this: Model<any>, data: SearchPaginationMongooseModel<T>, mapper: Function=(elem:any)=>elem): Promise<Paginator<T>> {
        const { pageNumber, pageSize, sortBy, sortDirection, filter = {} } = data
        const setPaginator = async (items: any) => {
            const count = await this.countDocuments(filter)
            // const count = filter ? await this.countDocuments(filter) : await this.countDocuments()
            const result: Paginator<any> = {
                "pagesCount": Math.ceil(count / pageSize),
                "page": pageNumber,
                "pageSize": pageSize,
                "totalCount": count,
                items
            }
            return result
        }
        // if (filter) {
        //     const items = (await this
        //         .find(filter)
        //         .skip((pageNumber - 1) * pageSize)
        //         .limit(pageSize)
        //         .sort({ [sortBy]: sortDirection })
        //         .lean({ virtuals: true }))
        //         .map((elem) => {
        //             const { _id, ...other } = elem
        //             return { id: _id.toString(), ...other }
        //         })
        //     const result = setPaginator(items)

        //     return result
        // }
        const items = (await this
            .find()
            .find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .lean({ virtuals: true }))
            .map((elem, index, array) => {
                const { _id, ...other } = elem
                return mapper( { id: _id.toString(), ...other })
            })
        // .map((elem) => {
        //     const { _id, ...other } = elem
        //     return { id: _id.toString(), ...other }
        // })
        const result = setPaginator(items)

        return result
    }
    // <LeanResultType = RawDocType extends Document ? LeanDocumentOrArray<ResultType> : LeanDocumentOrArrayWithRawType<ResultType, Require_id<RawDocType>>>
    // Omit<T, Exclude<keyof Document, '_id' | 'id' | '__v'> | '$isSingleNested'>
    // (T extends Document<any, any, any> ? LeanDocumentOrArray<import("mongoose").HydratedDocument<T, {}, {}> | null> : import("mongoose").LeanDocumentOrArrayWithRawType<import("mongoose").HydratedDocument<T, {}, {}> | null, import("mongoose").Require_id<T>>) | ({ id: any; } & Omit<NonNullable<T extends Document<any, any, any> ? LeanDocumentOrArray<import("mongoose").HydratedDocument<T, {}, {}> | null> : import("mongoose").LeanDocumentOrArrayWithRawType<import("mongoose").HydratedDocument<T, {}, {}> | null, import("mongoose").Require_id<T>>>, "_id">)
    // LeanDocument<import("mongoose").HydratedDocument<{},{},T>>
    static async repositoryReadOne<T>(this: Model<any>, id: string): Promise<T> {
        const result = await this.findOne({ _id: new ObjectId(id) }).lean({ virtuals: true })
        if (!result) return result
        const { _id, ...other } = result
        return { id: _id.toString(), ...other }
    }
    static async repositoryCreateOne<T>(this: Model<any>, element: Omit<T, "id">): Promise<string> {
        const objectId: ObjectId = (await this.create(element))._id
        const id = objectId.toString()
        // if (result) return id
        return id
    }
    static async repositoryUpdateOne<T>(this: Model<any>, id: string, data: Partial<T>) {
        const result = await this.updateOne({ _id: new ObjectId(id) }, { $set: data })
        return result.modifiedCount === 1
    }
    static async repositoryReplaceOne<T>(this: Model<any>, id: string, element: T) {
        const result = await this.replaceOne({ _id: new ObjectId(id) }, element)
        return result.modifiedCount === 1
    }
    static async repositoryDeleteOne(this: Model<any>, id: string) {
        const result = await this.deleteOne({ _id: new ObjectId(id) })
        return result.deletedCount === 1
    }
    static async repositoryDeleteAll(this: Model<any>) {
        const result = await this.deleteMany()
        return result.acknowledged
    }
}


// export async function repositoryReadOne<T = typeof this.schema>(this: Model<any>, id: string): Promise<T> {
//     const result = await this.findOne({ _id: new ObjectId(id) }).lean({ virtuals: true })
//     if (!result) return result
//     const { _id, ...other } = result
//     return { id: _id.toString(), ...other }
// }
// let a = { name: "sasa", repositoryReadOne }
// const b = await a.repositoryReadOne("as")