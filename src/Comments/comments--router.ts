import express from 'express';

import { code400 } from '../_common/validators/code400-middleware';
import { commentIdUriParamValidationMiddleware } from '../_common/validators/commentID-param-validation-middleware';
import { commentsInputModelSchemaValidationMiddleware } from '../_common/validators/commentsInputSchema-validation-middleware';
import { authHeadersJwtAccessTokenHeaders401 } from '../_common/guards/JwtAccessTokenHeaders401-middleware';
import commentsController from './comments-controller';
import { authHeadersJwtAccessTokenHeaders } from '../_common/guards/JwtAccessTokenHeaders-middleware';
import likeController from '../Likes/like-controller';
import { likeStatusModelSchemaValidationMiddleware } from '../_common/validators/likeStatusSchema-validation-middleware';


export const commentsRouter = express.Router()

commentsRouter.put(`/comments/:commentId`,
    <any> authHeadersJwtAccessTokenHeaders401,
    commentIdUriParamValidationMiddleware,
    commentsInputModelSchemaValidationMiddleware,
    code400,
    <any> commentsController.updateOne
)
commentsRouter.delete(`/comments/:commentId`,
    <any> authHeadersJwtAccessTokenHeaders401,
    commentIdUriParamValidationMiddleware,
    code400,
    <any> commentsController.deleteOne
)
commentsRouter.get(`/comments/:commentId`,
    authHeadersJwtAccessTokenHeaders,
    commentIdUriParamValidationMiddleware,
    code400,
    commentsController.readOne
)
commentsRouter.put("/comments/:commentId/like-status",
    <any> authHeadersJwtAccessTokenHeaders401,
    likeStatusModelSchemaValidationMiddleware,
    commentIdUriParamValidationMiddleware,
    code400,
    likeController.upsertOne
)
