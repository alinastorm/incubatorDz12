import mongoDbClient from './_common/services/mongoDb/mongoDbClient'
import emailService from "./_common/services/email/email-service";
import periodicTasks from "./_common/services/taskManager/periodicTasks-service";
import httpService from './_common/services/http/http-service';
import mongooseClinet from './_common/services/mongoose/mongoose-client';


await mongooseClinet.connect()
// await mongoDbClient.connect()
// await mongoDbClient.ping()
await emailService.connect()
// periodicTasks.run()
httpService.setMiddlewares()
httpService.setRoutes()
httpService.runHttpsServer()
//// httpService.runHttpServer()
