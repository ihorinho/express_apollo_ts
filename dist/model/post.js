import { Schema, model } from "mongoose";
const postSchema = new Schema({
    title: {
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
export const Post = model('Post', postSchema);
