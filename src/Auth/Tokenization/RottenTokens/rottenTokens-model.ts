import mongoose, { model, Schema } from "mongoose"
import { RepositoryMongoose } from "../../../_common/abstractions/Repository/Repository-mongoose"

export interface RottenToken {
    id: string
    refreshToken: string
    expirationDate: Date
}

/**Комментарий */
//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
export const rottenTokenSchema = new Schema<RottenToken, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String,
    refreshToken: String,
    expirationDate: Date
}, { versionKey: false })




//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
rottenTokenSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const RottenTokenModel = model("canceledTokens", rottenTokenSchema)