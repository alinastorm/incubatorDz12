import request from "supertest"
import httpService from "../_common/services/http/http-service"
import { Paginator } from "../_common/abstractions/Repository/repository-mongodb-types"
import { LoginInputModel, MeViewModel } from "../Auth/Authentications/auth-model"
import { UserInputModel } from "./user-model"
import mongooseClinet from "../_common/services/mongoose/mongoose-client"


//Express
const app = httpService.appExpress

//helpers
function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {//подсвечивает req если ошибка что бы consolelog не искать
    if (obj[key] != val) return obj
    return true
}
function logger(obj: { [key: string]: any }) {
    return obj
}
const mainRout = "Users"
describe(`${mainRout}`, () => {

    beforeAll(async () => {
        //Конектим mongo клиента
        await mongooseClinet.disconnect();
        await mongooseClinet.connect()
        //Устанавливаем роуты и middlewares
        httpService.setMiddlewares()
        httpService.setRoutes()
    })
    afterAll(async () => {
        // await mongoDbClient.disconnect()
    })

    /** ****************************************************************************************** */
    const user: UserInputModel = {
        "login": "sasa",
        "password": "qwerty",
        "email": "7534640@gmail.com"
    }
    const auth: LoginInputModel = {
        loginOrEmail: "sasa",
        password: "qwerty"
    }
    const paginationSchema: Paginator<any> = {
        page: expect.any(Number),
        pagesCount: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: expect.any(Array),
    }
    let accessTokenRecived: string
    let refreshTokenRecived: string
    const meSchema: MeViewModel = {
        email: expect.any(String),
        login: expect.any(String),
        userId: expect.any(String),
    }

    test(`All delete`, async () => {
        const { status } = await request(app).delete("/testing/all-data")
        expect(status).toBe(204)
    })
    test(`GET users =[null]`, async () => {
        const { status, body } = await request(app).get(`/users`)

        expect(status).toBe(200)

        expect(body).toStrictEqual({
            "pagesCount": 0,
            "page": 1,
            "pageSize": 10,
            "totalCount": 0,
            "items": []
        })

    })
    test(`Create User without admin rights`, async () => {
        const { status } = await request(app).post("/users")

            .send(user)

        expect(status).toBe(401)
    })
    test(`Create User`, async () => {
        const { status } = await request(app).post("/users")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(user)

        expect(status).toBe(201)
    })
    test(`Auth login`, async () => {
        const res = await request(app).post("/auth/login")
            .send(auth)

        const body = res.body
        accessTokenRecived = body.accessToken
        expect(body).toStrictEqual({
            "accessToken": expect.any(String)
        })
        expect(accessTokenRecived).toStrictEqual(expect.any(String))
        //check refresh token
        const jwt = res.headers['set-cookie'][0].split(";")[0].split("=")
        const tokenName = jwt[0]
        refreshTokenRecived = jwt[1]
        expect(tokenName).toBe("refreshToken")
        expect(refreshTokenRecived).toStrictEqual(expect.any(String))
    })
    test(`Auth send access token in cookies`, async () => {
        const res = await request(app).get("/auth/me")
            .auth(accessTokenRecived, { type: 'bearer' })
        expect(res.body).toMatchObject(meSchema)

    })
})