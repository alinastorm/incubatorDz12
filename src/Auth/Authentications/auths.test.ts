import request from "supertest"
import httpService from "../../_common/services/http/http-service"
import { Paginator } from "../../_common/abstractions/Repository/repository-mongodb-types"
import { UserInputModel, UserViewModel } from "../../Users/user-model"
import { LoginInputModel } from "./auth-model"
import mongooseClinet from "../../_common/services/mongoose/mongoose-client"


//Express
const app = httpService.appExpress


function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {
    if (obj[key] != val) return obj
    return true
}

describe("Auth", () => {

    beforeAll(async () => {
        //Конектим mongo клиента
        // await mongoDbClient.disconnect();
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
    let userReceived: UserViewModel
    const userViewSchema: UserViewModel = {
        id: expect.any(String),
        login: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(String),
    }
    const userPaginationSchema: Paginator<UserViewModel> = {
        page: expect.any(Number),
        pagesCount: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: [userViewSchema]
    }
    let newUser: UserInputModel = {
        "login": "User1",
        "password": "Password1",
        "email": "user1@gmail.com"
    }
    const userUpdate: Partial<UserViewModel> = {
        "email": "user112@gmail.com"
    }
    const wrongUser: Partial<LoginInputModel> = {
        "loginOrEmail": "UserWrong",
        "password": "PasswordWrong",
    }
    const login: LoginInputModel = {
        "loginOrEmail": "User1",
        "password": "Password1",
    }
    test('All delete', async () => {
        const { status } = await request(app).delete("/testing/all-data")
        expect(status).toBe(204)
    })
    test('Return All users = []', async () => {

        const { status, body } = await request(app)
            .get("/users")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')


        expect(status).toBe(200)

        expect(body).toStrictEqual({
            "pagesCount": 0,
            "page": 1,
            "pageSize": 10,
            "totalCount": 0,
            "items": []
        })

    })
    test('Add new user to the system', async () => {
        const { status, body } = await request(app)
            .post("/users")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newUser)

        expect(status).toBe(201)
        expect(body).toMatchObject(userViewSchema)
    })
    test('Return All users', async () => {

        const { status, body } = await request(app)
            .get("/users")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')


        expect(status).toBe(200)

        expect(body).toStrictEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": 1,
            "items": [userViewSchema]
        })

    })
    test('Try login user to the system', async () => {
        const { status } = await request(app)
            .post("/auth/login")
            .send(login)
        expect(status).toBe(200)
    })
    test('Try login wrong user to the system', async () => {
        const { status } = await request(app)
            .post("/auth/login")
            .send(wrongUser)
        expect(status).toBe(401)
    })
    test('Return All users after added', async () => {

        const { status, body }: { status: any, body: Paginator<UserViewModel> } = await request(app).get("/users")

        expect(status).toBe(200)
        expect(body).toMatchObject(userPaginationSchema)
        userReceived = body.items[0]
    })
    test('Delete User by ID', async () => {

        const req = await request(app)
            .delete(`/users/${userReceived.id}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')

        expect(checkData(req, "status", 204)).toBe(true)
    })
    test('Try login after delete User to the system', async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                "login": "User1",
                "password": "Password1",
            })
        expect(checkData(res,"status",400)).toBe(true)
    })
    test('GET User after delete by ID', async () => {
        const { status } = await request(app)
            .get(`/blogs/${userReceived?.id}`)

        expect(status).toBe(404)

    })
})