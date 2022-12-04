import { UserBdModel, UserModel, UserViewModel } from '../../Users/user-model';
import { APIErrorResult } from '../../_common/validators/types';
import cryptoService from '../../_common/services/crypto/crypto-service';
import { HTTP_STATUSES, RequestWithBody, ResponseWithBodyCode, ResponseWithCode } from '../../_common/services/http/types';
import { v4 as uuidv4 } from 'uuid'

import emailService from '../../_common/services/email/email-service';
import { NewPasswordRecoveryInputModel, PasswordRecoveryInputModel, PasswordRecoveryBdModel, PasswordRecoveryModel } from './recoveryPassword-model';
import { AuthBDModel, AuthModel, AuthViewModel } from '../Authentications/auth-model';

class RecoveryPasswordController {

    async passwordRecowery(
        req: RequestWithBody<PasswordRecoveryInputModel>,
        res:
            ResponseWithCode<204> & // Even if current email is not registered (for prevent user's email detection)
            ResponseWithBodyCode<APIErrorResult, 400> &
            ResponseWithBodyCode<APIErrorResult, 429> &
            ResponseWithBodyCode<APIErrorResult, 500>
    ) {
        const email = req.body.email
        //отправляем письмо
        const subject = "Password recovery"
        const recoveryCode = uuidv4()
        const link = `${process.env.API_URL}/auth/password-recovery?recoveryCode=${recoveryCode}'`
        const message =
            `
                <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                   <a href='${link}'>recovery password</a>
               </p>
            `
        try {
            emailService.sendEmail(email, subject, message)
        } catch (error) {
            const result: APIErrorResult = { errorsMessages: [{ message: "send mail error", field: "email" }] }
            return res.status(HTTP_STATUSES.SERVER_ERROR_500).json(result)
        }
        //записываем  recoveryCode и email в бд
        const element: Omit<PasswordRecoveryBdModel, "id"> = { recoveryCode, email }
        await PasswordRecoveryModel.repositoryCreateOne<PasswordRecoveryBdModel>(element)

        //отправка ответа
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
    async newPassword(
        req: RequestWithBody<NewPasswordRecoveryInputModel>,
        res:
            ResponseWithCode<204> &
            ResponseWithBodyCode<APIErrorResult, 400> &
            ResponseWithBodyCode<APIErrorResult, 429> &
            ResponseWithBodyCode<APIErrorResult, 500>
    ) {
        const { newPassword, recoveryCode } = req.body
        //проверка recovery code
        const passwordFilter: Partial<PasswordRecoveryBdModel> = { recoveryCode }
        const codes = await PasswordRecoveryModel.repositoryReadAll<PasswordRecoveryBdModel>(passwordFilter)
        if (!codes.length) return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        //поиск usera по email
        const email = codes[0].email
        const userFilter: Partial<UserViewModel> = { email }
        const users = await UserModel.repositoryReadAll<UserBdModel>(userFilter)
        if (!users.length) res.sendStatus(400)
        //запись нового хэша пароля
        const userId = users[0].id
        const authFilter: Partial<AuthBDModel> = { userId }
        const auths = await AuthModel.repositoryReadAll<AuthBDModel>(authFilter)
        const authId = auths[0].id
        const passwordHash = await cryptoService.generatePasswordHash(newPassword)
        const data: Pick<AuthViewModel, "passwordHash"> = { passwordHash }
        await AuthModel.repositoryUpdateOne(authId, data)
        res.sendStatus(204)
    }
}
export default new RecoveryPasswordController()