import { model, Schema } from "mongoose";
import { RepositoryMongoose } from "../_common/abstractions/Repository/Repository-mongoose";



export interface UserInputModel {
    login: string // maxLength: 10 minLength: 3
    password: string // maxLength: 20 minLength: 6
    email: string // pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $
}
export interface UserViewModel {
    id: string
    login: string
    email: string
    createdAt?: string //	TODO в дз не обязательный в интерфей
}
export interface UserBdModel {
    id: string
    login: string
    email: string
    confirm: boolean //мое
    createdAt?: string //	TODO в дз не обязательный в интерфей
}
export interface UsersSearchPaginationMongoDbModel {
    /**Search term for user Login: Login should contains this term in any position
     * Default value : null
     */
    searchLoginTerm: string
    /**Search term for user Email: Email should contains this term in any position
     * Default value : null
     */
    searchEmailTerm: string
    /**PageNumber is number of portions that should be returned.
     * Default value : 1
     */
    pageNumber: number
    /**PageSize is portions size that should be returned
     * Default value : 10
     */
    pageSize: number
    /** Sorting term
     * Default value : createdAt
     */
    sortBy: string
    /** Sorting direction
     * Default value: desc
     */
    sortDirection: 1 | -1
}


//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
export const userBdSchema = new Schema<UserBdModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String,
    login: String,
    email: String,
    confirm: Boolean, //мое
    createdAt: String, //	TODO в дз не обязательный в интерфей
}, { versionKey: false })
//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
userBdSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const UserModel = model("users", userBdSchema)