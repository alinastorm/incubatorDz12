import { UserBdModel, UserViewModel } from '../../Users/user-model';
import { APIErrorResult } from '../../_common/validators/types';
import cryptoService from '../../_common/services/crypto/crypto-service';
import { HTTP_STATUSES, RequestWithBody, RequestWithCookies, RequestWithHeaders, ResponseWithBodyCode, ResponseWithCode, ResponseWithCookies } from '../../_common/services/http/types';
import { jwtTokenService } from '../../_common/services/token/jwtToken-service';
import { AuthBDModel, AuthModel, LoginInputModel, LoginSuccessViewModel, MeViewModel } from './auth-model';
import { v4 as uuidv4 } from 'uuid'
import { RefreshTokenPayloadModel } from '../Tokenization/tokens-types';
import { UserModel } from '../../Users/user-model';
import { DeviceBdModel, DeviceSessionModel } from '../DevicesSessions/deviceSession-model';

class AuthController {
    /** Try login user to the system*/
    async Login(
        req: RequestWithBody<LoginInputModel>
            & { ip: string }
            & RequestWithHeaders<{ "user-agent": string }>,
        res:
            ResponseWithBodyCode<{ accessToken: string }, 200> &
            ResponseWithCookies<{ refreshToken: string }> &
            ResponseWithBodyCode<APIErrorResult, 401>
    ) {
        const { loginOrEmail, password } = req.body
        // Проверяем существование юзера с указанным логином
        const users= await UserModel.repositoryReadAll<UserBdModel>({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
        const user = users[0]
        if (!user) return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("No login")
        // Проверяем подтверждение почты пользователя
        if (user.confirm !== true) return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("Not confirm email")
        // Достаем hash юзера
        // Проверяем существование hash в bd
        const userId = user.id
        const auths = await AuthModel.repositoryReadAll<AuthBDModel>({ userId })
        const auth = auths[0]
        if (!auth) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401).send("No auth")
        // Проверка равенства пароля и hasha в bd
        const passwordHash = auth.passwordHash
        const isEqual = await cryptoService.checkPasswordByHash(passwordHash, password)
        if (!isEqual) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401).send("Pass wrong")
        // TODO Проверка существования в сессиях присланного deviceId или отправка запроса нового устройства если не прислано.Пусть присылают в body deviceId из localStorage длительного хранения. Сброс на нижний уровень где есть доверие к мылу. При подтвеждении мыла можно сеитить deviceId и отправлять на мыло сообщение (что бы два раза в первый раз не дурить голову)
        // Генерация токенов Access Refresh
        const accessToken: LoginSuccessViewModel = jwtTokenService.generateAccessToken({ userId })
        const deviceId: string = uuidv4()// Id of connected device session
        const refreshToken: string = jwtTokenService.generateRefreshToken({ userId, deviceId })
        const maxAgeSeconds = process.env.JWT_REFRESH_LIFE_TIME_SECONDS || console.log("No JWT_REFRESH_LIFE_TIME_SECONDS");

        const maxAgeMiliSeconds = +maxAgeSeconds * 1000
        // Записываем device Session        
        const ip: string = req.ip // IP address of device during signing in 
        const title: string = req.headers['user-agent']// Device name: for example Chrome 105 (received by parsing http header "user-agent") 
        const iat: number = jwtTokenService.getIatFromToken(refreshToken) //iat from token
        const lastActiveDate: string = iat.toString()//Date of the last generating of refresh/access tokens 
        const element: Omit<DeviceBdModel, "id"> = { lastActiveDate, deviceId, ip, title, userId }
        DeviceSessionModel.repositoryCreateOne(element)

        // Отправка токенов Access Refresh
        res.cookie("refreshToken", refreshToken, { maxAge: maxAgeMiliSeconds, httpOnly: true, secure: true })
        res.status(HTTP_STATUSES.OK_200).send(accessToken)
    }
    /**In cookie client must send correct refreshToken that will be revoked
     * Задача бека, отметить refreshToken как невалидный (токен приходит в cookie)
    */
    async logout(
        req: RequestWithCookies<{ refreshToken: string }> & { user: RefreshTokenPayloadModel },
        res:
            ResponseWithCode<204> &
            ResponseWithCode<401>
    ) {
        // deprecated //добавляем в списаные
        // const reqRefreshToken = req.cookies.refreshToken
        // createOneCanceledToken(reqRefreshToken)

        const { deviceId, userId } = req.user
        const deviceSessions = await DeviceSessionModel.repositoryReadAll<DeviceBdModel>({ deviceId, userId })
        deviceSessions.forEach(async ({ id }) => {
            await DeviceSessionModel.repositoryDeleteOne(id)
        })
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
    async getUser(
        req: RequestWithHeaders<{ authorization: string }> & { user: { userId: string } },
        res: ResponseWithBodyCode<MeViewModel, 200 | 401 | 500>
    ) {
        const userId = req.user.userId
        //ищем юзера по id
        const user: UserViewModel | null = await UserModel.repositoryReadOne(userId)
        if (!user) return res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
        const result: MeViewModel = {
            email: user.email,
            login: user.login,
            userId: user.id
        }
        res.status(HTTP_STATUSES.OK_200).send(result)
    }
}
export default new AuthController()