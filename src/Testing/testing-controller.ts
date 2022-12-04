import { Request } from 'express';
import { AuthModel } from '../Auth/Authentications/auth-model';
import { DeviceSessionModel } from '../Auth/DevicesSessions/deviceSession-model';
import { PasswordRecoveryModel } from '../Auth/RecoveryPassword/recoveryPassword-model';
import { RegistrationModel } from '../Auth/Registrations/registration-model';
import { BlogModel } from '../Blogs/blog-model';
import { CommentModel } from '../Comments/comment-model';
import { PostModel } from '../Posts/post-model';
import { UserModel } from '../Users/user-model';
import { HTTP_STATUSES, ResponseWithCode } from '../_common/services/http/types';



class TestingController {

    async deleteAll(req: Request, res: ResponseWithCode<204>) {
        await PostModel.repositoryDeleteAll()
        await BlogModel.repositoryDeleteAll()
        await UserModel.repositoryDeleteAll()
        await AuthModel.repositoryDeleteAll()
        await DeviceSessionModel.repositoryDeleteAll()
        await RegistrationModel.repositoryDeleteAll()
        await PasswordRecoveryModel.repositoryDeleteAll()
        await CommentModel.repositoryDeleteAll()
        res.status(HTTP_STATUSES.NO_CONTENT_204).send('All data is deleted')
    }


}
export default new TestingController()