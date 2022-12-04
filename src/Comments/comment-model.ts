import mongoose, { model, Schema } from "mongoose"
import { LikeStatus } from "../Likes/like-model"
import { RepositoryMongoose } from "../_common/abstractions/Repository/Repository-mongoose"

export interface CommentInputModel {
    content: string //   maxLength: 300     minLength: 20
}
export interface CommentViewModel {
    id: string //nullable: true //TODO может быть nullable
    content: string
    userId: string
    userLogin: string
    createdAt?: string//($date-time) 	//TODO в дз не обязательный в интерфей
    likesInfo: LikesInfoViewModel
}
export interface CommentBdModel {

    id: string //nullable: true
    content: string
    userId: string
    userLogin: string
    postId: string
    createdAt?: string//($date-time)
    likesInfo: LikesInfoBdModel
}
export interface LikesInfoBdModel {
    /** Total likes for parent item */
    likesCount: number //	integer($int32)    
    /** Total dislikes for parent item */
    dislikesCount: number //	integer($int32)    
    /** Send None if you want to unlike\undislike */
    myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]
}
export interface LikesInfoViewModel {
    /** Total likes for parent item */
    likesCount: number //	integer($int32)    
    /** Total dislikes for parent item */
    dislikesCount: number //	integer($int32)    
    /** Send None if you want to unlike\undislike */
    myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]
}

/**Лайки коментария */
const likesInfoBdModel = new mongoose.Schema<LikesInfoBdModel>({
    /** Total likes for parent item */
    likesCount: Number, //	integer($int32)    
    /** Total dislikes for parent item */
    dislikesCount: Number, //	integer($int32)    
    /** Send None if you want to unlike\undislike */
    myStatus: { type: String, enum: LikeStatus } //	h11.LikeStatusstring Enum:    Array[3]
}, { versionKey: false, _id: false })



/**Комментарий */
//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
export const commentBdSchema = new Schema<CommentBdModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String, //nullable: true
    content: String,
    userId: String,
    userLogin: String,
    postId: String,
    createdAt: String,//($date-time)
    likesInfo: likesInfoBdModel
}, { versionKey: false })




//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
commentBdSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const CommentModel = model("posts", commentBdSchema)