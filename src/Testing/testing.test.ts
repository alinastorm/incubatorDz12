import request from "supertest"
import httpService from "../_common/services/http/http-service"


//Express
const app = httpService.appExpress

//Helpers
function checkData(obj: { [key: string]: any }, key: keyof typeof obj, val: any) {
  if (obj[key] != val) return obj
  return true
}

describe("Testing", () => {

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

  test('/testing/all-data', async () => {
    const req = await request(app).get('/');
    expect(req.statusCode).toBe(200);
  })

})