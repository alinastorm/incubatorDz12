import { Schema, model } from "mongoose";
import { LikeStatus } from "../Likes/like-model";
import { RepositoryMongoose } from "../_common/abstractions/Repository/Repository-mongoose";
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { ObjectId } from "mongodb";
import { Rename } from "../_common/types/types";
//Types
export interface PostInputModel {
    title: string//    maxLength: 30
    shortDescription: string//    maxLength: 100
    content: string//maxLength: 1000
    blogId: string
}
export interface ExtendedLikesInfoViewModel {
    /** Total likes for parent item */
    /** Virtual prop Mongoose*/
    likesCount: number //	integer($int32) 
    /** Total dislikes for parent item */
    /** Virtual prop Mongoose*/
    dislikesCount: number //	integer($int32) 
    /** Send None if you want to unlike\undislike */
    /** Virtual prop Mongoose*/
    myStatus: LikeStatus //string Enum: Array[3]    
    /** Last 3 likes (status "Like") */
    /** Virtual prop Mongoose*/
    newestLikes: [LikeDetailsViewModel] | []
}
export interface PostViewModel {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string//TODO в дз не обязательный в интерфей
    extendedLikesInfo: ExtendedLikesInfoViewModel
}
export interface PostBdModel {
    _id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string//TODO в дз не обязательный в интерфей
    extendedLikesInfo: ExtendedLikesInfoBdModel
}
export interface ExtendedLikesInfoBdModel {
    /** Likes */
    likes: [LikeDetailsViewModel],
    /** Deslike */
    deslike: [LikeDetailsViewModel]
}
export interface LikeDetailsViewModel {
    /** Details about single like*/
    addedAt: string //	string($date - time)
    userId: string //	string    nullable: true,
    login: string //	string    nullable: true}
}

//Mongoose
export const LikeDetailsViewSchema = new Schema<LikeDetailsViewModel>({
    addedAt: String, //	string($date - time)
    userId: String, //	string    nullable: true,
    login: String //	string    nullable: true}

}, { versionKey: false, _id: false })

export const ExtendedLikesInfoViewModelSchema = new Schema<ExtendedLikesInfoBdModel>({
    likes: { type: [LikeDetailsViewSchema], _id: false, default: [] },
    // likes: { type: [LikeDetailsViewSchema], filter: true, _id: false, default: [] },
    deslike: { type: [LikeDetailsViewSchema], _id: false, default: [] },
}, { versionKey: false, _id: false })
// }, { versionKey: false, _id: false, toObject: { virtuals: true }, toJSON: { virtuals: true } })
ExtendedLikesInfoViewModelSchema.plugin(mongooseLeanVirtuals);

ExtendedLikesInfoViewModelSchema.virtual('likesCount').get(function () {
    return this.likes.length;
});
ExtendedLikesInfoViewModelSchema.virtual('dislikesCount').get(function () {
    return this.deslike.length;
});
ExtendedLikesInfoViewModelSchema.virtual('newestLikes').get(function () {
    return this.likes.slice(-3);
});

ExtendedLikesInfoViewModelSchema.set('toObject', { virtuals: true })
//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
export const postSchema = new Schema<PostBdModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    // export const postSchema = new Schema<Rename<PostBdModel, "id", "_id">, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    //@ts-ignore
    id: { type: String },
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: String,//TODO в дз не обязательный в интерфей
    extendedLikesInfo: { type: ExtendedLikesInfoViewModelSchema, default: () => ({}) },
    // extendedLikesInfo:  ExtendedLikesInfoViewModelSchema,
}, {
    versionKey: false,
    // toObject: {
    //     // hide: "_id",
    //     transform(doc, ret, options) {
    //         if (options.hide) {
    //             options.hide.split(' ').forEach(function (prop) {
    //                 delete ret[prop];
    //             });
    //         }
    //         return ret;
    //     },
    // }
})
// postSchema.pre(/^find/, function (next) {
// const t = this
//     next()
// })
postSchema.plugin(mongooseLeanVirtuals);

// Now, the `lowercase` property will show up even if you do a lean query




// postSchema.set('toObject', { virtuals: true })
// postSchema.set('toJSON', { virtuals: true })
//Или select:false
// postSchema.methods.toJSON = function() {
//     let obj = this.toObject();
//     delete obj.password;
//     return obj;
//    }


//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
postSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const PostModel = model("posts", postSchema)



// doc.toObject();                                        // { secret: 47, name: 'Wreck-it Ralph' }
// doc.toObject({ hide: 'secret _id', transform: false });// { _id: 'anId', secret: 47, name: 'Wreck-it Ralph' }
// doc.toObject({ hide: 'secret _id', transform: true }); // { name: 'Wreck-it Ralph' }