import { model, Schema } from "mongoose";
import { RepositoryMongoose } from "../../_common/abstractions/Repository/Repository-mongoose";


export interface LoginInputModel {
    loginOrEmail: string
    password: string
}
export interface LoginSuccessViewModel {
    /** JWT access token */
    accessToken: string
}
export interface AuthInputModel {
    userId: string
    /**  maxLength: 20 minLength: 6 */
    passwordHash: string
}
export interface AuthViewModel {
    id: string
    userId: string
    /**  maxLength: 20 minLength: 6 */
    passwordHash: string
    createdAt: string
}
export interface AuthBDModel {
    id: string
    userId: string
    /**  maxLength: 20 minLength: 6 */
    passwordHash: string
    createdAt: string
}
export interface MeInputModel {
    /**Headers */
}
export interface MeViewModel {
    email: string
    login: string
    userId: string
}



/**Комментарий */
//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
const authSchema = new Schema<AuthBDModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String,
    userId: String,
    /**  maxLength: 20 minLength: 6 */
    passwordHash: String,
    createdAt: String,
}, { versionKey: false })

//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
authSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const AuthModel = model("auth", authSchema)