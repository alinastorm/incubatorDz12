import request from "supertest"
import httpService from "../_common/services/http/http-service"


//Express
const app = httpService.appExpress

//Helpers
function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {
  if (obj[key] != val) return obj
  return true
}

describe("posts", () => {

  beforeAll(async () => {
    //Конектим mongo клиента
    // await mongoDbClient.disconnect();
    // await mongoDbClient.connect()
    //Устанавливаем роуты и middlewares
    httpService.setRoutes()
    httpService.setMiddlewares()
  })
  afterAll(async () => {
    // await mongoDbClient.disconnect()
  })

  /** ****************************************************************************************** */
  test('start page /', async () => {
    const req = await request(app).get('/');

    expect(req.header['content-type']).toBe('text/html; charset=utf-8');
    expect(req.statusCode).toBe(200);
    expect(req.text).toEqual('Hallo Samurai: 1.0.0');
  });
})