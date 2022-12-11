import { Model } from 'mongoose';
import { PostBdModel, postDataMapper, PostModel, PostViewModel } from './post-model';

class PostQueryRepository {

    constructor(private PostModel: Model<PostBdModel>, private mapper: () => PostViewModel | null) { }

    async findAll() {
        const posts = await this.PostModel.find({}).lean().then(this.mapper)
        return posts
    }

}
export default new PostQueryRepository(PostModel, postDataMapper)