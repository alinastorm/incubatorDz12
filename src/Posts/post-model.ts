import { Schema, model } from "mongoose";
import { RepositoryMongoose } from "../_common/abstractions/Repository/Repository-mongoose";

export interface PostInputModel {
    title: string//    maxLength: 30
    shortDescription: string//    maxLength: 100
    content: string//maxLength: 1000
    blogId: string
}
export interface PostViewModel {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string//TODO в дз не обязательный в интерфей
}
export interface PostBdModel {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string//TODO в дз не обязательный в интерфей
}


//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
export const postSchema = new Schema<PostBdModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String,
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: String,//TODO в дз не обязательный в интерфей
}, { versionKey: false })
//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
postSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const PostModel = model("posts", postSchema)


