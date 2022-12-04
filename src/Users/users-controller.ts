import cryptoService from '../_common/services/crypto/crypto-service';
import { Filter, ObjectId } from 'mongodb';
import { UserBdModel, UserInputModel, UsersSearchPaginationMongoDbModel, UserViewModel } from './user-model';

import { HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithQuery, ResponseWithBodyCode, ResponseWithCode } from '../_common/services/http/types';
import { Paginator, SearchPaginationMongoDbModel } from '../_common/abstractions/Repository/repository-mongodb-types';
import { SearchPaginationMongooseModel } from '../_common/abstractions/Repository/repository-mongoose-type';
import { FilterQuery } from 'mongoose';
import { UserModel } from './user-model';
import { AuthModel, AuthViewModel } from '../Auth/Authentications/auth-model';


class UserController {

    async readAllPagination(
        req: RequestWithQuery<UsersSearchPaginationMongoDbModel>,
        res: ResponseWithBodyCode<Paginator<UserViewModel>, 200>
    ) {

        const { pageNumber, pageSize, searchEmailTerm, searchLoginTerm, sortBy, sortDirection } = req.query

        const filter: FilterQuery<UserViewModel> = { $or: [] }
        if (searchEmailTerm) filter.$or?.push({ email: { $regex: searchEmailTerm, $options: 'i' } })
        if (searchLoginTerm) filter.$or?.push({ login: { $regex: searchLoginTerm, $options: 'i' } })
        let query: SearchPaginationMongooseModel
        filter.$or?.length ?
            query = { pageNumber, pageSize, filter, sortBy, sortDirection } :
            query = { pageNumber, pageSize, sortBy, sortDirection }

        const users = await UserModel.repositoryReadAllOrByPropPaginationSort<UserBdModel>(query)
        const result: Paginator<UserViewModel> = users
        result.items = users.items.map(({ email, id, login, createdAt }): UserViewModel => {
            return { email, id, login, createdAt }
        })

        res.status(HTTP_STATUSES.OK_200).send(result)
    }
    async createOne(
        req: RequestWithBody<UserInputModel>,
        res: ResponseWithBodyCode<Omit<UserViewModel, "confirm">, 201 | 404>
    ) {

        const { email, login, password } = req.body
        const createdAt = new Date().toISOString()
        const elementUser: Omit<UserBdModel, 'id'> = { email, login, createdAt, confirm: true }
        const userId: string = (await UserModel.create(elementUser))._id.toString()
        const passwordHash = await cryptoService.generatePasswordHash(password)
        const elementAuth: Omit<AuthViewModel, "id"> = { passwordHash, userId, createdAt }
        const idAuth: string = await AuthModel.repositoryCreateOne(elementAuth)

        const user: UserBdModel | null = await UserModel.repositoryReadOne(userId)

        if (!user) return res.status(HTTP_STATUSES.NOT_FOUND_404)
        const { confirm, ...other } = user
        const result = other
        res.status(HTTP_STATUSES.CREATED_201).send(result)
    }
    async deleteOne(
        req: RequestWithParams<{ id: string }>,
        res: ResponseWithCode<204> &
            ResponseWithCode<404>
    ) {
        const id = req.params.id
        if (!ObjectId.isValid(id)) return res.status(HTTP_STATUSES.NOT_FOUND_404).send(`id not valid id:${id}`)
        const result: boolean = await UserModel.repositoryDeleteOne(id)
        if (!result) return res.status(HTTP_STATUSES.NOT_FOUND_404).send("user not found")
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

}
export default new UserController()