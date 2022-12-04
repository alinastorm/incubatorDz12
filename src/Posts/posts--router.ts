import express from 'express';
import { titleBodyValidationMiddleware } from '../_common/validators/title-validation-middleware';
import { postIdParamValidationMiddleware } from '../_common/validators/postIdParam-validation-middleware';
import { contentBodyValidationMiddleware } from '../_common/validators/content-validation-middleware';
import { shortdescriptionBodyValidationMiddleware } from '../_common/validators/shortdescription-validation-middleware';
import { BasicAuthorizationMiddleware401 } from '../_common/guards/BasicAuthHeaders-validation-middleware';
import { code400 } from '../_common/validators/code400-middleware';
import { pageNumberQueryValidationMiddleware } from '../_common/validators/pageNumber-validation-middleware';
import { pageSizeQueryValidationMiddleware } from '../_common/validators/pageSize-validation-middleware';
import { sortByPostsQueryValidationMiddleware } from '../_common/validators/sortByPosts-validation-middleware';
import { sortDirectionQueryValidationMiddleware } from '../_common/validators/sortDirection-validation-middleware';

import { commentsInputModelSchemaValidationMiddleware } from '../_common/validators/commentsInputSchema-validation-middleware';
import { sortByCommentsQueryValidationMiddleware } from '../_common/validators/sortByComments-validation-middleware';
import postsController from './posts-controller';
import { postParamIdInBDValidationMiddleware } from '../_common/validators/PostsIdParamInBD-validation-middleware';
import { blogIdBodyInBDValidationMiddleware404 } from '../_common/validators/blogIdBodyInBD-validation-middleware';
import commentsController from '../Comments/comments-controller';
import { authHeadersJwtAccessTokenHeaders401 } from '../_common/guards/JwtAccessTokenHeaders401-middleware';
import { authHeadersJwtAccessTokenHeaders } from '../_common/guards/JwtAccessTokenHeaders-middleware';


export const postsRouter = express.Router()


postsRouter.get(`/posts/:postId/comments`,
authHeadersJwtAccessTokenHeaders,
    pageNumberQueryValidationMiddleware,
    pageSizeQueryValidationMiddleware,
    sortByCommentsQueryValidationMiddleware,
    sortDirectionQueryValidationMiddleware,
    code400,
    postParamIdInBDValidationMiddleware,
    <any> commentsController.readAllByPostIdPaginationSort
)
postsRouter.post(`/posts/:postId/comments`,
    <any> authHeadersJwtAccessTokenHeaders401,
    postIdParamValidationMiddleware,
    commentsInputModelSchemaValidationMiddleware,
    code400,
    // postParamIdInBDValidationMiddleware,
    <any> commentsController.createOneByPostId
)
postsRouter.get(`/posts`,
    pageNumberQueryValidationMiddleware,
    pageSizeQueryValidationMiddleware,
    sortByPostsQueryValidationMiddleware,
    sortDirectionQueryValidationMiddleware,
    code400,
    <any> postsController.readAllPaginationSort
)
postsRouter.post(`/posts`,
<any>BasicAuthorizationMiddleware401,
    titleBodyValidationMiddleware,
    shortdescriptionBodyValidationMiddleware,
    contentBodyValidationMiddleware,
    blogIdBodyInBDValidationMiddleware404,
    code400,
    // bloggerBodyIdInBDValidationMiddleware,
    postsController.createOne
)
postsRouter.get(`/posts/:postId`,
    postIdParamValidationMiddleware,
    code400,
    postParamIdInBDValidationMiddleware,
    postsController.readOne
)
postsRouter.put(`/posts/:postId`,
<any>BasicAuthorizationMiddleware401,
    postIdParamValidationMiddleware,
    titleBodyValidationMiddleware,
    shortdescriptionBodyValidationMiddleware,
    contentBodyValidationMiddleware,
    blogIdBodyInBDValidationMiddleware404,
    code400,
    postParamIdInBDValidationMiddleware,
    // bloggerBodyIdInBDValidationMiddleware,
    postsController.updateOne
)
postsRouter.delete(`/posts/:postId`,
<any>BasicAuthorizationMiddleware401,
    postIdParamValidationMiddleware,
    code400,
    postParamIdInBDValidationMiddleware,
    postsController.deleteOne
)

