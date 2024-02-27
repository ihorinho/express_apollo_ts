import * as mongoose from "mongoose";
import { Schema, Document, model } from "mongoose";
import { IUser} from "./user.js";

export interface IPost extends Document {
    title: string,
    content: string,
    image: string,
    creator: IUser,
    createdAt: Date,
    updatedAt: Date
}

const postSchema = new Schema<IPost>({
    title : {
       type: String,
       required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: {
        createdAt: 'createdAt', // Use `created_at` to store the created date
        updatedAt: 'updatedAt' // and `updated_at` to store the last updated date
    }
});

export const Post = model<IPost>('Post', postSchema);