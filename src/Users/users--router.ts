import express from 'express';

import { BasicAuthorizationMiddleware401 } from '../_common/guards/BasicAuthHeaders-validation-middleware';
import { code400 } from '../_common/validators/code400-middleware';
import { searchLoginTermQueryValidationMiddleware } from '../_common/validators/searchLoginTerm-query-validation-middleware';
import { searchEmailTermQueryValidationMiddleware } from '../_common/validators/searchEmailTerm-query-validation-middleware';
import { sortDirectionQueryValidationMiddleware } from '../_common/validators/sortDirection-validation-middleware';
import { pageSizeQueryValidationMiddleware } from '../_common/validators/pageSize-validation-middleware';
import { pageNumberQueryValidationMiddleware } from '../_common/validators/pageNumber-validation-middleware';
import { sortByUsersQueryValidationMiddleware } from '../_common/validators/sortByUsers-validation-middleware';
import { loginBodyValidationMiddleware } from '../_common/validators/login-body-validation-middleware';
import { passwordBodyValidationMiddleware } from '../_common/validators/password-body-validation-middleware';
import { emailBodyValidationMiddleware } from '../_common/validators/email-validation-middleware';
import { userIdParamUriValidationMiddleware } from '../_common/validators/userId-param-validation-middleware';
import usersController from './users-controller';


export const usersRouter = express.Router()


usersRouter.get(`/users`,
    searchLoginTermQueryValidationMiddleware,
    searchEmailTermQueryValidationMiddleware,
    pageNumberQueryValidationMiddleware,
    pageSizeQueryValidationMiddleware,
    sortByUsersQueryValidationMiddleware,
    sortDirectionQueryValidationMiddleware,
    code400,
    <any> usersController.readAllPagination
)
usersRouter.post(`/users`,
    <any> BasicAuthorizationMiddleware401,
    loginBodyValidationMiddleware,
    passwordBodyValidationMiddleware,
    emailBodyValidationMiddleware,
    code400,
    usersController.createOne
)
usersRouter.delete(`/users/:id`,
    <any> BasicAuthorizationMiddleware401,
    userIdParamUriValidationMiddleware,
    code400,
    usersController.deleteOne
)