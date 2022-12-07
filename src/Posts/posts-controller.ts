import { Request } from 'express';
import { Paginator } from '../_common/abstractions/Repository/repository-mongodb-types';
import { HTTP_STATUSES, RequestWithAccessTokenJWTBearer, RequestWithBody, RequestWithParams, RequestWithParamsBody, RequestWithParamsQuery, RequestWithQuery, ResponseWithBodyCode, ResponseWithCode } from '../_common/services/http/types';
import { LikeDetailsViewModel, PostBdModel, postDataMapper, PostInputModel, PostModel, postSchema, PostViewModel } from './post-model';
import { SearchPaginationMongooseModel } from '../_common/abstractions/Repository/repository-mongoose-type';
import { FilterQuery, QueryOptions } from 'mongoose';
import { BlogBdModel, BlogModel } from '../Blogs/blog-model';
import { LikeInputModel, LikeStatus } from '../Likes/like-model';
import { UserModel } from '../Users/user-model';
import { ObjectId } from 'mongodb';


class PostsController {

    async readAll(
        req: Request,
        res: ResponseWithBodyCode<PostViewModel[], 200>) {
        const posts = await PostModel.repositoryReadAll<PostBdModel>() as any
        const result = posts.map((post: any): PostViewModel => {
            return {
                id: post.id,
                title: post.title,
                blogId: post.blogId,
                blogName: post.blogName,
                content: post.content,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    dislikesCount: post.extendedLikesInfo.dislikesCount,
                    likesCount: post.extendedLikesInfo.likesCount,
                    myStatus: post.extendedLikesInfo.myStatus,
                    newestLikes: post.extendedLikesInfo.newestLikes,
                },
                shortDescription: post.shortDescription,
            }
        })
        res.status(HTTP_STATUSES.OK_200).send(result)
    }
    async readAllPaginationSort(
        req: RequestWithQuery<{ pageNumber: number, pageSize: number, sortBy: keyof PostViewModel, sortDirection: 1 | -1 }>,
        res: ResponseWithBodyCode<Paginator<PostViewModel>, 200>
    ) {
        const { pageNumber, pageSize, sortBy, sortDirection } = req.query
        const query: SearchPaginationMongooseModel<PostBdModel> = { pageNumber, pageSize, sortBy, sortDirection }
        const paginatorPosts: Paginator<PostViewModel> = await PostModel.repositoryReadAllOrByPropPaginationSort(query) as any
        const items = paginatorPosts.items.map((post): PostViewModel => {
            return {
                id: post.id,
                title: post.title,
                blogId: post.blogId,
                blogName: post.blogName,
                content: post.content,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    dislikesCount: post.extendedLikesInfo.dislikesCount,
                    likesCount: post.extendedLikesInfo.likesCount,
                    myStatus: post.extendedLikesInfo.myStatus,
                    newestLikes: post.extendedLikesInfo.newestLikes,
                },
                shortDescription: post.shortDescription,
            }
        })
        const result = { ...paginatorPosts, items }
        res.status(HTTP_STATUSES.OK_200).json(result)
    }
    async createOne(
        req: RequestWithBody<PostInputModel>,
        res: ResponseWithBodyCode<PostViewModel, 201 | 400 | 500>) {

        const { blogId, content, shortDescription, title } = req.body
        const blog = await BlogModel.repositoryReadOne<BlogBdModel>(blogId)
        if (!blog) return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)

        const { name: blogName } = blog
        const createdAt = new Date().toISOString()
        const element: Omit<PostViewModel, 'id'> = { blogId, blogName, content, createdAt, shortDescription, title } as any
        const id: string = await PostModel.repositoryCreateOne(element)

        // const cont = { blogId }
        // PostModel.findById=PostModel.findById.bind(cont) .blogId="123"

        PostModel.schema.virtual('extendedLikesInfo.myStatus').get(function () {
            return LikeStatus.None;
        });
        //@ts-ignore
        const post: any | null = await PostModel.findById(id).lean({ virtuals: true }) as any
        // const post: PostViewModel | null = await PostModel.findById(id).populate(
        //     {
        //         path: 'extendedLikesInfo', populate:
        //             { path: 'myStatus', transform: (doc, blogId) => doc }
        //     }).lean({ virtuals: true }) as any
        const post2: PostViewModel | null = await PostModel.findById(id) as any
        if (!post) return res.status(HTTP_STATUSES.BAD_REQUEST_400)
        const result: PostViewModel = {
            id: post._id,
            title: post.title,
            blogId: post.blogId,
            blogName: post.blogName,
            content: post.content,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                likesCount: post.extendedLikesInfo.likesCount,
                myStatus: post.extendedLikesInfo.myStatus,
                newestLikes: post.extendedLikesInfo.newestLikes,
            },
            shortDescription: post.shortDescription,
        }
        res.status(HTTP_STATUSES.CREATED_201).send(result)
    }
    async readOne(
        req: RequestWithParams<{ postId: string }> &
            RequestWithAccessTokenJWTBearer,
        res: ResponseWithBodyCode<PostViewModel, 200 | 404> &
            ResponseWithCode<404>
    ) {
        const postId = req.params.postId
        const userId = req.user!.userId

        PostModel.schema.virtual('extendedLikesInfo.myStatus').get(function () {
            //@ts-ignore
            const likes = this.extendedLikesInfo.likes.filter((elem) => elem.userId === userId)
            //@ts-ignore
            const deslikes = this.extendedLikesInfo.deslike.filter((elem) => elem.userId === userId)
            console.log("userId:", userId);

            const result: LikeStatus =
                (likes[0] ? LikeStatus.Like : undefined) ||
                (deslikes[0] ? LikeStatus.None : undefined) ||
                LikeStatus.None
            return result
        });


        const post = await PostModel.findById(postId).lean({
            virtuals: true,
            //   transform: postDataMapper,
        }).then(postDataMapper)

        if (!post) {
            return res.status(HTTP_STATUSES.NOT_FOUND_404).send("post ")
        }


        res.status(HTTP_STATUSES.OK_200).send(post)
    }
    async updateOne(
        req: RequestWithParamsBody<{ postId: string }, PostInputModel>,
        res: ResponseWithCode<204 | 404>) {

        const id = req.params.postId
        const { blogId, content, shortDescription, title } = req.body

        const query: Partial<PostViewModel> = { blogId, content, shortDescription, title } as any
        const post = await PostModel.repositoryReadOne<PostBdModel>(id)
        if (!post) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
        await PostModel.repositoryUpdateOne<PostBdModel>(id, <any> query)
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
    async deleteOne(
        req: RequestWithParams<{ postId: string }>,
        res: ResponseWithCode<204 | 404>) {
        const postId = req.params.postId
        const post = await PostModel.repositoryReadOne<PostBdModel>(postId)
        if (!post) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
        const isDeleted = await PostModel.repositoryDeleteOne(postId)

        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
    async deleteAll(req: Request, res: ResponseWithCode<204>) {
        await PostModel.repositoryDeleteAll()
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
    async readAllPostsByBlogIdWithPaginationAndSort(
        req: RequestWithParamsQuery<{ blogId: string }, { pageNumber: number, pageSize: number, sortBy: keyof PostViewModel, sortDirection: 1 | -1 }>,
        res: ResponseWithBodyCode<Paginator<PostViewModel>, 200 | 404>
    ) {
        const blogId = req.params.blogId
        const { pageNumber, pageSize, sortBy, sortDirection } = req.query
        const filter: FilterQuery<PostViewModel> = { blogId }

        const query: SearchPaginationMongooseModel = { pageNumber, pageSize, sortBy, sortDirection, filter }
        const paginatorPosts: Paginator<PostViewModel> = await PostModel.repositoryReadAllOrByPropPaginationSort<PostBdModel>(query) as any
        if (!paginatorPosts) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
        const items = paginatorPosts.items.map((post): PostViewModel => {
            return {
                id: post.id,
                title: post.title,
                blogId: post.blogId,
                blogName: post.blogName,
                content: post.content,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    dislikesCount: post.extendedLikesInfo.dislikesCount,
                    likesCount: post.extendedLikesInfo.likesCount,
                    myStatus: post.extendedLikesInfo.myStatus,
                    newestLikes: post.extendedLikesInfo.newestLikes,
                },
                shortDescription: post.shortDescription,
            }
        })
        const result = { ...paginatorPosts, items }
        res.status(HTTP_STATUSES.OK_200).send(result)
    }
    async createPostsByBlogId(
        req: RequestWithParamsBody<{ blogId: string }, PostInputModel>,
        res: ResponseWithBodyCode<PostViewModel, 201 | 404>
    ) {
        const blogId = req.params.blogId
        const { content, shortDescription, title } = req.body
        const blog = await BlogModel.repositoryReadOne<BlogBdModel>(blogId)
        if (!blog) return res.status(HTTP_STATUSES.NOT_FOUND_404)
        const { name: blogName } = blog
        const createdAt = new Date().toISOString()
        const query: Omit<PostViewModel, 'id'> = { blogId, blogName, content, createdAt, shortDescription, title } as any
        const id = await PostModel.repositoryCreateOne<PostBdModel>(<any> query)
        const post: PostViewModel | null = await PostModel.repositoryReadOne<PostBdModel>(id) as any
        if (!post) return res.status(HTTP_STATUSES.NOT_FOUND_404)
        const result: PostViewModel = {
            id: post.id,
            title: post.title,
            blogId: post.blogId,
            blogName: post.blogName,
            content: post.content,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                dislikesCount: post.extendedLikesInfo.dislikesCount,
                likesCount: post.extendedLikesInfo.likesCount,
                myStatus: post.extendedLikesInfo.myStatus,
                newestLikes: post.extendedLikesInfo.newestLikes,
            },
            shortDescription: post.shortDescription,
        }

        res.status(HTTP_STATUSES.CREATED_201).send(result)
    }
    async likeUnlike(
        req: RequestWithBody<LikeInputModel>
            & RequestWithParams<{ postId: string }>
            & RequestWithAccessTokenJWTBearer,
        res: ResponseWithCode<204 | 400 | 401 | 404>) {
        //инициализация
        const likeStatus: LikeStatus = req.body.likeStatus
        const userId = req.user!.userId
        const postId = req.params.postId
        //проверка posta
        const post = await PostModel.findById(postId).lean()
        if (!post) return res.status(HTTP_STATUSES.NOT_FOUND_404).send("post not found")
        //блок обновления информации о лайках
        if (likeStatus === LikeStatus.Like) {
            const user = await UserModel.findById(userId).lean()
            if (!user) return res.status(HTTP_STATUSES.NOT_FOUND_404).send("user not found")
            const login = user.login

            const likes = post?.extendedLikesInfo.likes
            const deslikes = post?.extendedLikesInfo.deslike
            const addedAt = new Date().toISOString()
            const elem: LikeDetailsViewModel = { addedAt, login, userId }
            likes.push(elem)
            const deslikesFiltered = deslikes.filter((elem) => elem.userId != userId)
            //добавляем лайки
            //удаляем дизлайки
            const postInstance = await PostModel.findById(postId)
            //@ts-ignore TODO
            postInstance.extendedLikesInfo.likes = [...new Set(likes)]
            //@ts-ignore TODO
            postInstance.extendedLikesInfo.deslike = [...deslikesFiltered]
            const result = await postInstance?.save()


        }
        if (likeStatus === LikeStatus.Dislike) {
            const user = await UserModel.findById(userId).lean()
            if (!user) return res.status(HTTP_STATUSES.NOT_FOUND_404).send("user not found")
            const login = user.login

            const likes = post?.extendedLikesInfo.likes
            const deslikes = post?.extendedLikesInfo.deslike
            const addedAt = new Date().toISOString()
            const elem: LikeDetailsViewModel = { addedAt, login, userId }
            deslikes.push(elem)
            const likesFiltered = likes.filter((elem) => elem.userId != userId)

            //добавляем дизлайки
            //удаляем лайки
            const postInstance = await PostModel.findById(postId)
            //@ts-ignore TODO
            postInstance.extendedLikesInfo.likes = [...likesFiltered]
            //@ts-ignore TODO
            postInstance.extendedLikesInfo.deslike = [...new Set(deslikes)]
            const result = await postInstance?.save()

        }
        if (likeStatus === LikeStatus.None) {
            const user = await UserModel.findById(userId).lean()
            if (!user) return res.status(HTTP_STATUSES.NOT_FOUND_404).send("user not found")
            const login = user.login

            const likes = post?.extendedLikesInfo.likes
            const deslikes = post?.extendedLikesInfo.deslike


            const deslikesFiltered = deslikes.filter((elem) => elem.userId != userId)
            const likesFiltered = likes.filter((elem) => elem.userId != userId)

            //удаляем дизлайки
            //удаляем лайки
            const postInstance = await PostModel.findById(postId)
            //@ts-ignore TODO
            postInstance.extendedLikesInfo.likes = [...deslikesFiltered]
            //@ts-ignore TODO
            postInstance.extendedLikesInfo.deslike = [...likesFiltered]
            const result = await postInstance?.save()
        }

        // const comment = await CommentModel.repositoryReadOne<CommentBdModel>(postId)
        // if (!comment) return res.sendStatus(404)
        // //читаем like если не было лайков создаем дефолтный
        // const likes = await likesModel.find({ commentId, userId })

        // // const likes = await likeRepository.readAll({ commentId, userId })
        // let userLike: LikesBdModel = likes[0]
        // //@ts-ignore
        // let likeId: string = userLike?._id.toString()
        // if (!likeId) {
        //     const elementLike: Omit<LikesBdModel, "id"> = { commentId, myStatus: LikeStatus.None, userId }
        //     userLike = await likesModel.create(elementLike)
        //     //@ts-ignore
        //     likeId = userLike._id.toString()
        //     // likeId = await likeRepository.createOne(elementLike)
        //     // userLike = await likeRepository.readOne(likeId)
        // }

        // //обновление comments.likesInfo
        // const newLikesInfo: LikesInfoViewModel = { ...comment.likesInfo }

        // if (myStatus === LikeStatus.Like) {
        //     if (userLike?.myStatus === LikeStatus.Dislike) {
        //         newLikesInfo.likesCount++
        //         newLikesInfo.dislikesCount--
        //     } else if (userLike?.myStatus === LikeStatus.None) {
        //         newLikesInfo.likesCount++
        //     }
        // }

        // if (myStatus === LikeStatus.Dislike) {
        //     if (userLike?.myStatus === LikeStatus.Like) {
        //         newLikesInfo.dislikesCount++
        //         newLikesInfo.likesCount--
        //     } else if (userLike?.myStatus === LikeStatus.None) {
        //         newLikesInfo.dislikesCount++
        //     }
        // }

        // if (myStatus === LikeStatus.None) {

        //     if (userLike?.myStatus === LikeStatus.Dislike) {
        //         newLikesInfo.dislikesCount--
        //     }
        //     if (userLike?.myStatus === LikeStatus.Like) {
        //         newLikesInfo.likesCount--
        //     }
        // }
        // await CommentModel.repositoryUpdateOne(commentId, { likesInfo: newLikesInfo })
        // //обновляем myLike
        // const elementUpdate: Partial<LikesBdModel> = { myStatus }
        // await likesModel.updateOne({ _id: likeId }, elementUpdate, { upsert: false })

        //отправка результата
        res.sendStatus(204)
    }
}
export default new PostsController()
