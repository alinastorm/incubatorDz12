import mongoose, { model, Schema } from "mongoose"
import { RepositoryMongoose } from "../../_common/abstractions/Repository/Repository-mongoose"

export interface NewPasswordRecoveryInputModel {
    newPassword: string//    maxLength: 20    minLength: 6    New password    
    recoveryCode: string//    New password    
}
export interface PasswordRecoveryInputModel {
    /** Email of registered user */
    email: string//    pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $       
}
export interface PasswordRecoveryBdModel {
    id: string
    recoveryCode: string
    email: string//    pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $       
}



/**Комментарий */
//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
const passwordRecoverySchema = new Schema<PasswordRecoveryBdModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String,
    recoveryCode: String,
    email: String,//    pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $  
}, { versionKey: false })

//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
passwordRecoverySchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const PasswordRecoveryModel = model("passwordrecoveries", passwordRecoverySchema)