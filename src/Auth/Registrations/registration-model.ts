import { model, Schema } from "mongoose"
import { RepositoryMongoose } from "../../_common/abstractions/Repository/Repository-mongoose"

export interface RegistrationCodeViewModel {
    id: string
    userId: string
    email: string
    code: string
    expirationDate: Date
    // restartTime: Date
}
export interface RegistrationConfirmationCodeModel {
    /**Code that be sent via Email inside link */
    code: string
}

export interface RegistrationEmailResending {
    /**Email of already registered but not confirmed user */
    email: string //    pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$  
}


/**Комментарий */
//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
const registrationCodeSchema = new Schema<RegistrationCodeViewModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String,
    userId: String,
    email: String,
    code: String,
    expirationDate: Date
    // restartTime: Date
}, { versionKey: false })

//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
registrationCodeSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const RegistrationModel = model("registrationcodes", registrationCodeSchema)