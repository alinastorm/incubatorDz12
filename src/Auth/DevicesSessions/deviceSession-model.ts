import mongoose, { model, Schema } from "mongoose"
import { RepositoryMongoose } from "../../_common/abstractions/Repository/Repository-mongoose"

/** Device session */
export interface DeviceViewModel {
    /** IP address of device during signing in */
    ip: string
    /** Device name: for example Chrome 105 (received by parsing http header "user-agent") */
    title: string
    /** Date of the last generating of refresh/access tokens */
    lastActiveDate: string
    /** Id of connected device session */
    deviceId: string

}
export interface DeviceBdModel {
    id: string
    /** IP address of device during signing in */
    ip: string
    /** Device name: for example Chrome 105 (received by parsing http header "user-agent") */
    title: string
    /** Date of the last generating of refresh/access tokens */
    lastActiveDate: string
    /** Id of connected device session */
    deviceId: string
    /**мое юзер так как нужен поиск сессий пользователя */
    userId: string
}

/**Комментарий */
//<тип самой схемы,,InstanceMethods,QueryHelpers,Виртуальные методы,Сатические методы>
const deviceSessionsSchema = new Schema<DeviceBdModel, {}, RepositoryMongoose, {}, {}, typeof RepositoryMongoose>({
    id: String,
    /** IP address of device during signing in */
    ip: String,
    /** Device name: for example Chrome 105 (received by parsing http header "user-agent") */
    title: String,
    /** Date of the last generating of refresh/access tokens */
    lastActiveDate: String,
    /** Id of connected device session */
    deviceId: String,
    /**мое юзер так как нужен поиск сессий пользователя */
    userId: String,
}, { versionKey: false })

//Метод достает методы Класса и разносит их static в статичские ,методы инстанса в инстанс. 
deviceSessionsSchema.loadClass(RepositoryMongoose);
//создаем модель(Класс) из схемы с сатическими и инстанс методами
export const DeviceSessionModel = model("deviceSessions", deviceSessionsSchema)