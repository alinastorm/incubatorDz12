import request from "supertest"
import httpService from "../_common/services/http/http-service"
import { CommentInputModel, CommentViewModel, LikesInfoViewModel } from "../Comments/comment-model"
import { BlogInputModel, BlogViewModel } from "../Blogs/blog-model"
import { UserInputModel } from "../Users/user-model"
import { LoginInputModel } from "../Auth/Authentications/auth-model"
import { PostInputModel, PostViewModel } from "../Posts/post-model"
import { LikeInputModel, LikeStatus } from "./like-model"
import mongooseClinet from "../_common/services/mongoose/mongoose-client"


//Express
const app = httpService.appExpress

//helpers
function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {//подсвечивает req если ошибка что бы consolelog не искать
    if (obj[key] != val) return obj
    return true
}
const mainRout = "comments"
describe.only(`${mainRout}`, () => {

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

    const likesInfo: LikesInfoViewModel = {
        dislikesCount: expect.any(Number),
        likesCount: expect.any(Number),
        myStatus: expect.any(String),
    }
    const likeNone: LikeInputModel = {
        "likeStatus": LikeStatus.None
    }
    const likeLike: LikeInputModel = {
        "likeStatus": LikeStatus.Like
    }
    const likeDislike: LikeInputModel = {
        "likeStatus": LikeStatus.Dislike
    }
    // consts  
    const newBlog: BlogInputModel = {
        "name": "stringasda",
        "description": "stringadas",
        "websiteUrl": "https://someurl.com"
    }
    const blogSchema: BlogViewModel = {
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
    }
    let blogReceived: BlogViewModel
    const user: UserInputModel = {
        "login": "sasa",
        "password": "qwerty",
        "email": "7534640@gmail.com"
    }
    const auth: LoginInputModel = {
        loginOrEmail: "sasa",
        password: "qwerty"
    }
    let accessTokenRecived: string
    let refreshTokenRecived: string
    let postReceived: PostViewModel
    const postViewSchema: PostViewModel = {
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String)
    }
    let newPost: PostInputModel = {
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": "string"
    }
    const newComment: CommentInputModel = {
        content: "start comment. super comment. lalalalalalalala"
    }
    const commentSchema: CommentViewModel = {
        id: expect.any(String),
        content: expect.any(String),
        userId: expect.any(String),
        userLogin: expect.any(String),
        likesInfo: likesInfo,
    }
    let commentReceived: CommentViewModel
    // TESTS
    //создаем  Blog через админа
    test('1 POST Create Blog ', async () => {
        const req = await request(app)
            .post("/blogs")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newBlog)


        expect(checkData(req, "statusCode", 201)).toBe(true)
        expect(req.body).toMatchObject(blogSchema)

        blogReceived = req.body
        newPost.blogId = blogReceived.id
    })
    //создаем пользователя
    test(`2 Create User`, async () => {
        const { status } = await request(app).post("/users")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(user)

        expect(status).toBe(201)
    })
    //логинимся
    test(`3 Auth login`, async () => {
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
    //создаем Post в Blog  через админа
    test('4 Create Post', async () => {
        const res = await request(app)

            .post("/posts")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newPost)


        expect(checkData(res, "status", 201)).toBe(true)
        expect(res.body).toMatchObject(postViewSchema)
        postReceived = res.body
    })
    //создаем Comment в Post  с accessToken
    test(`5 POST Create Comment authorized`, async () => {
        const req = await request(app).post(`/posts/${postReceived.id}/comments`)
            .auth(accessTokenRecived, { type: 'bearer' })
            .send(newComment)


        expect(checkData(req, "statusCode", 201)).toBe(true)
        expect(req.body).toMatchObject(commentSchema)

        commentReceived = req.body
    })
    //получаем комментарий по commentId лайк должен быть "None" с accessToken
    test(`6 GET Comment by CommentID is Like None`, async () => {
        const { status, body } = await request(app).get(`/comments/${commentReceived?.id}`)
            .auth(accessTokenRecived, { type: 'bearer' })

        expect(status).toBe(200)
        expect(body).toMatchObject(commentSchema)
        expect(body).toStrictEqual(commentReceived)
        expect(body.likesInfo).toMatchObject(likesInfo)
        expect(body.likesInfo).toStrictEqual({
            dislikesCount: 0,
            likesCount: 0,
            myStatus: LikeStatus.None,
        })

    })
    //Лайкаем комментарий должен вернуться 204 с accessToken
    test(`7 GET Comment by CommentID set like Like`, async () => {
        const { status, body } = await request(app).put(`/comments/${commentReceived?.id}/like-status`)
            .auth(accessTokenRecived, { type: 'bearer' })
            .send(likeLike)
        expect(status).toBe(204)

    })
    //Получаем комментарий по id смотрим есть ли лайк и likesCount 1 с accessToken
    test(`8 GET Comment by CommentID is like like`, async () => {
        const { status, body } = await request(app).get(`/comments/${commentReceived?.id}`)
            .auth(accessTokenRecived, { type: 'bearer' })

        expect(status).toBe(200)
        expect(body).toMatchObject(commentSchema)
        expect(body.likesInfo).toMatchObject(likesInfo)
        expect(body.likesInfo).toStrictEqual({
            dislikesCount: 0,
            likesCount: 1,
            myStatus: LikeStatus.Like,
        })

    })
    //Снимаем лайк через None с accessToken
    test(`9 GET Comment by CommentID set like None`, async () => {
        const { status, body } = await request(app).put(`/comments/${commentReceived?.id}/like-status`)
            .auth(accessTokenRecived, { type: 'bearer' })
            .send(likeNone)
        expect(status).toBe(204)

    })
    //проверяем None с accessToken
    test(`10 GET Comment by CommentID is Like NONE`, async () => {
        const { status, body } = await request(app).get(`/comments/${commentReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(commentSchema)
        expect(body.likesInfo).toMatchObject(likesInfo)
        expect(body.likesInfo).toStrictEqual({
            dislikesCount: 0,
            likesCount: 0,
            myStatus: LikeStatus.None,
        })

    })
    //Дизлайкаем комментарий должен вернуться 204 с accessToken
    test(`11 GET Comment by CommentID set like None`, async () => {
        const { status, body } = await request(app).put(`/comments/${commentReceived?.id}/like-status`)
            .auth(accessTokenRecived, { type: 'bearer' })
            .send(likeDislike)
        expect(status).toBe(204)
    })
    //Получаем комментарий по id смотрим есть ли дизлайк
    test(`12 GET Comment by CommentID is Like Dislike`, async () => {
        const { status, body } = await request(app).get(`/comments/${commentReceived?.id}`)
            .auth(accessTokenRecived, { type: 'bearer' })

        expect(status).toBe(200)
        expect(body).toMatchObject(commentSchema)
        expect(body.likesInfo).toMatchObject(likesInfo)
        expect(body.likesInfo).toStrictEqual({
            dislikesCount: 1,
            likesCount: 0,
            myStatus: LikeStatus.Dislike,
        })

    })
    //Снимаем дизлайк через None с accessToken
    test(`13 GET Comment by CommentID set like None`, async () => {
        const { status, body } = await request(app).put(`/comments/${commentReceived?.id}/like-status`)
            .auth(accessTokenRecived, { type: 'bearer' })
            .send(likeNone)
        expect(status).toBe(204)

    })
    //проверяем None
    test(`14 GET Comment by CommentID is Like Dislike`, async () => {
        const { status, body } = await request(app).get(`/comments/${commentReceived?.id}`)

        expect(status).toBe(200)
        expect(body).toMatchObject(commentSchema)
        expect(body).toStrictEqual(commentReceived)
        expect(body.likesInfo).toMatchObject(likesInfo)
        expect(body.likesInfo).toStrictEqual({
            dislikesCount: 0,
            likesCount: 0,
            myStatus: LikeStatus.None,
        })

    })
})