import { Schema, model, connect, Document } from 'mongoose';
import {Post} from "../generated/resolvers-types";

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    status: string;
    posts: Post[];
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'new'
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// 3. Create a Model.
export const User = model<IUser>('User', userSchema);