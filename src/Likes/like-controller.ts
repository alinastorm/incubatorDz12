import { CommentBdModel, CommentModel, LikesInfoViewModel } from "../Comments/comment-model"
import { RequestWithAccessTokenJWTBearer, RequestWithBody, RequestWithParams, ResponseWithCode } from "../_common/services/http/types"
import { likesModel } from "./like-model"
import { LikeInputModel, LikesBdModel, LikeStatus } from "./like-model"





class likeController {

    async upsertOne(
        req: RequestWithBody<LikeInputModel>
            & RequestWithParams<{ commentId: string }>
            & RequestWithAccessTokenJWTBearer,
        res: ResponseWithCode<204 | 400 | 401 | 404>) {

        const myStatus = req.body.likeStatus
        const userId = req.user!.userId
        //проверка есть ли комменатрий по commentId
        const commentId = req.params.commentId
        const comment = await CommentModel.repositoryReadOne<CommentBdModel>(commentId)
        if (!comment) return res.sendStatus(404)
        //читаем like если не было лайков создаем дефолтный
        const likes = await likesModel.find({ commentId, userId })

        // const likes = await likeRepository.readAll({ commentId, userId })
        let userLike: LikesBdModel = likes[0]
        //@ts-ignore
        let likeId: string = userLike?._id.toString()
        if (!likeId) {
            const elementLike: Omit<LikesBdModel, "id"> = { commentId, myStatus: LikeStatus.None, userId }
            userLike = await likesModel.create(elementLike)
            //@ts-ignore
            likeId = userLike._id.toString()
            // likeId = await likeRepository.createOne(elementLike)
            // userLike = await likeRepository.readOne(likeId)
        }

        //обновление comments.likesInfo
        const newLikesInfo: LikesInfoViewModel = { ...comment.likesInfo }

        if (myStatus === LikeStatus.Like) {
            if (userLike?.myStatus === LikeStatus.Dislike) {
                newLikesInfo.likesCount++
                newLikesInfo.dislikesCount--
            } else if (userLike?.myStatus === LikeStatus.None) {
                newLikesInfo.likesCount++
            }
        }

        if (myStatus === LikeStatus.Dislike) {
            if (userLike?.myStatus === LikeStatus.Like) {
                newLikesInfo.dislikesCount++
                newLikesInfo.likesCount--
            } else if (userLike?.myStatus === LikeStatus.None) {
                newLikesInfo.dislikesCount++
            }
        }

        if (myStatus === LikeStatus.None) {

            if (userLike?.myStatus === LikeStatus.Dislike) {
                newLikesInfo.dislikesCount--
            }
            if (userLike?.myStatus === LikeStatus.Like) {
                newLikesInfo.likesCount--
            }
        }
        await CommentModel.repositoryUpdateOne(commentId, { likesInfo: newLikesInfo })
        //обновляем myLike
        const elementUpdate: Partial<LikesBdModel> = { myStatus }
        await likesModel.updateOne({ _id: likeId }, elementUpdate, { upsert: false })

        //отправка результата
        res.sendStatus(204)
    }

}

export default new likeController()
