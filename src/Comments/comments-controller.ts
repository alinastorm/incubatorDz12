import { Request } from 'express';


import { CommentBdModel, CommentInputModel, CommentViewModel, LikesInfoViewModel } from './comment-model';
import { HTTP_STATUSES, RequestWithAccessTokenJWTBearer, RequestWithBody, RequestWithHeaders, RequestWithParams, RequestWithParamsBody, RequestWithParamsQuery, ResponseWithBodyCode, ResponseWithCode } from '../_common/services/http/types';
import { NoExtraProperties } from '../_common/types/types';
import { LikeStatus } from '../Likes/like-model';
import { Paginator } from '../_common/abstractions/Repository/repository-mongodb-types';
import { SearchPaginationMongooseModel } from '../_common/abstractions/Repository/repository-mongoose-type';
import { FilterQuery } from 'mongoose';
import { likesModel } from '../Likes/like-model';
import { UserModel } from '../Users/user-model';
import { PostModel } from '../Posts/post-model';
import { CommentModel } from './comment-model';


// делаем контроллеры комментов в коментах

class CommentsController {

    async createOneByPostId(
        req: RequestWithParamsBody<{ postId: string }, CommentInputModel>
            & RequestWithBody<CommentInputModel>
            & RequestWithHeaders<{ authorization: string }>
            & { user: { userId: string } },
        res: ResponseWithBodyCode<CommentViewModel, 201 | 401 | 404>
    ) {
        const postId = req.params.postId
        const post = await PostModel.findById(postId)
        if (!post) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)

        const userId = req.user.userId
        const user = await UserModel.findById(userId)
        if (!user) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)

        const { login: userLogin } = user
        const createdAt = new Date().toISOString()
        const content = req.body.content

        const likesInfo: LikesInfoViewModel = { dislikesCount: 0, likesCount: 0, myStatus: LikeStatus.None }
        const element: Omit<CommentBdModel, 'id'> = { content, userId, userLogin, createdAt, postId, likesInfo }
        const idComment: string = await (await CommentModel.create(element))._id.toString()
        {
            const comment = await CommentModel.repositoryReadOne<CommentBdModel>(idComment)
            if (!comment) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            const { postId, ...other } = comment
            const mapComment: NoExtraProperties<CommentViewModel, typeof other> = other
            res.status(201).send(mapComment)
        }
    }
    async readAll(req: Request, res: ResponseWithBodyCode<CommentBdModel[], 200>) {
        // TODO если есть access token сетим like Status
        const result = await CommentModel.repositoryReadAll<CommentBdModel>()
        res.send(result)
    }
    async readAllByPostIdPaginationSort(
        req: RequestWithParamsQuery<{ postId: string }, { pageNumber: number, pageSize: number, sortBy: keyof CommentBdModel, sortDirection: 1 | -1 }>
            & RequestWithAccessTokenJWTBearer,
        res: ResponseWithBodyCode<Paginator<CommentViewModel>, 200 | 404>
    ) {

        const { pageNumber, pageSize, sortBy, sortDirection } = req.query
        const postId = req.params.postId
        const filter: FilterQuery<CommentBdModel> = { postId }
        const query: SearchPaginationMongooseModel<CommentBdModel> = { pageNumber, pageSize, sortBy, sortDirection, filter }
        {
            //если есть acccess token
            const userId = req.user?.userId
            const comments = await CommentModel.repositoryReadAllOrByPropPaginationSort<CommentBdModel>(query)
            const { items, ...other } = comments
            let mapComments: Paginator<CommentViewModel>
            // если есть access token сетим like status
            if (userId) {
                mapComments = {
                    items: await Promise.all(items.map(async (el) => {
                        const { postId, ...other } = el
                        const likes = await likesModel.find({ commentId: el.id, userId })
                        const like = likes[0]
                        const status = like ? like.myStatus : LikeStatus.None
                        other.likesInfo.myStatus = status

                        return other
                    })),
                    ...other,
                }
            }
            mapComments = {
                items: items.map((el) => {
                    const { postId, ...other } = el
                    return other
                }),
                ...other,
            }
            const result: NoExtraProperties<Paginator<CommentViewModel>, typeof mapComments> = mapComments
            return res.status(200).send(result)
        }
    }
    async readOne(
        req: RequestWithParams<{ commentId: string }>
            & RequestWithAccessTokenJWTBearer
        ,
        res: ResponseWithBodyCode<CommentViewModel, 200 | 404>
    ) {
        const commentId = req.params.commentId
        const comment = await CommentModel.repositoryReadOne<CommentBdModel>(commentId)
        if (!comment) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        const { postId, ...other } = comment//TODO повесить защиту типа
        const result = other
        //если есть acccess token
        const userId = req.user?.userId
        if (userId) {
            const likes = await likesModel.find({ commentId, userId })
            const like = likes[0]
            const status = like ? like.myStatus : LikeStatus.None
            result.likesInfo.myStatus = status
        }
        //Проверка выходного типа . совпадение typeof и присвоения переменной обязательно
        const body: NoExtraProperties<CommentViewModel, typeof result> = result
        res.status(HTTP_STATUSES.OK_200).send(body)
    }
    async updateOne(
        req: RequestWithParamsBody<{ commentId: string }, CommentInputModel>
            & RequestWithHeaders<{ authorization: string }>
            & { user: { userId: string } },
        res: ResponseWithCode<204 | 403 | 404>) {

        const { commentId } = req.params
        const content = req.body.content
        const userId = req.user.userId
        const comment = await CommentModel.repositoryReadOne<CommentBdModel>(commentId)
        if (!comment) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        if (comment.userId !== userId) return res.sendStatus(HTTP_STATUSES.NO_ACCESS_CONTENT_403)
        const isUpdated = await CommentModel.repositoryUpdateOne(commentId, { content })
        isUpdated ?
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204) :
            null
    }
    async deleteOne(
        req: RequestWithParams<{ commentId: string }>
            & RequestWithHeaders<{ authorization: string }>
            & { user: { userId: string } },
        res: ResponseWithCode<204 | 403 | 404>
    ) {
        const { commentId } = req.params
        const userId = req.user.userId
        const comment = await CommentModel.repositoryReadOne<CommentBdModel>(commentId)
        if (!comment) return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        if (comment.userId !== userId) return res.sendStatus(HTTP_STATUSES.NO_ACCESS_CONTENT_403)
        const isDeleted = await CommentModel.repositoryDeleteOne(commentId)
        isDeleted ?
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204) : null
        // res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
    }

}
export default new CommentsController()