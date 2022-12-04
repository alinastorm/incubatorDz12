import mongoose from "mongoose"


export interface LikeInputModel {
    likeStatus: LikeStatus
}
export interface LikesBdModel {
    id: string
    commentId: string
    userId: string
    myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]

}
export enum LikeStatus {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}


const likeBdSchema = new mongoose.Schema<LikesBdModel>({
    id: String,
    commentId: String,
    userId: String,
    myStatus: {
        type: String,
        enum: LikeStatus
    }
}, { versionKey: false })



export const likesModel = mongoose.model("likes", likeBdSchema)