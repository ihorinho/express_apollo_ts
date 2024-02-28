import {MutationResolvers, UserData, PostInput} from '../generated/resolvers-types'
import validator from "validator";
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import {IUser, User} from '../model/user.js';
import {IPost, Post} from "../model/post.js";
import * as mongoose from "mongoose";
import imageProcessor from "../utils/imageProcessor.js";

const mutationResolvers: MutationResolvers = {
    addPost: async (parent, args, {isAuth, userId}) => {
        if (!isAuth) {
            throw new GraphQLError('Authorization failed', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: {
                        status: 401
                    }
                },
            });
        }

        const postInput = args.postInput as PostInput;
        const user = await User.findById(userId) as IUser;
        if (!user) {
            throw new GraphQLError('User not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }

        const title = postInput.title;
        const content = postInput.content;
        const image = postInput.image;
        const validationErrors = [];
        if (validator.isEmpty(title)) {
            validationErrors.push({field: 'title', message: 'This is required field'});
        }
        if (validator.isEmpty(content) || !validator.isLength(content, {min:10})) {
            validationErrors.push({field: 'content', message: 'Minimum length of content should be 10 characters'});
        }

        if (validationErrors.length > 0) {
            if (image) {
                imageProcessor.clearImage(image);
            }
            throw new GraphQLError('Validation failed', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    errors: validationErrors
                },
            });
        }

        let post = new Post({
            title: title,
            image: image,
            content: content,
            creator: user
        });

        const createdPost = await post.save() as IPost;
        user.posts.push(createdPost);
        await user.save();

        return {...createdPost.toObject(), createdAt: createdPost.createdAt.toISOString(), updatedAt: createdPost.updatedAt.toISOString(), imageUrl: createdPost.image};
    },

    updatePost: async (parent, args, {isAuth, userId}) => {
        if (!isAuth) {
            throw new GraphQLError('Authorization failed', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: {
                        status: 401
                    }
                },
            });
        }

        const postId = args.postId;
        const postInput = args.postInput as PostInput;
        let post = await Post.findById(postId).populate('creator') as IPost;
        if (!post) {
            throw new GraphQLError('Post not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: 'Post does not exist or user is not authrized',
                },
            });
        }

        if (userId !== post.creator._id.toString()) {
            throw new GraphQLError('Action is not authorizated', {
                extensions: {
                    code: 'NOT AUTHORIZED',
                    http: {
                        status: 401
                    }
                },
            });
        }

        /* Validation */
        const title = postInput.title;
        const content = postInput.content;
        const image = postInput.image;
        const validationErrors = [];
        if (validator.isEmpty(title)) {
            validationErrors.push({field: 'title', message: 'This is required field'});
        }
        if (validator.isEmpty(content) || !validator.isLength(content, {min:10})) {
            validationErrors.push({field: 'content', message: 'Minimum length of content should be 10 characters'});
        }

        if (validationErrors.length > 0) {
            throw new GraphQLError('Validation failed', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    errors: validationErrors
                },
            });
        }

        let oldImage = post.image;

        post.title = title;
        post.content = content;
        post.image = image;

        const updatedPost = await post.save();

        if (oldImage !== updatedPost.image) {
            imageProcessor.clearImage(oldImage);
        }

        return {...updatedPost.toObject(), createdAt: updatedPost.createdAt.toISOString(), updatedAt: updatedPost.updatedAt.toISOString()};
    },

    deletePost: async (parent, {postId}, {isAuth, userId}) => {
        if (!isAuth) {
            throw new GraphQLError('Authorization failed', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: {
                        status: 401
                    }
                },
            });
        }

        let post = await Post.findById(postId).populate('creator') as IPost;
        if (!post) {
            throw new GraphQLError('Not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: `Post with id: ${postId} not found`,
                },
            });
        }

        if (userId !== post.creator._id.toString()) {
            throw new GraphQLError('Authorization failed', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    message: 'This user is not authorized to delete this post',
                    http: {
                        status: 401
                    }
                },
            });
        }

        let user = await User.findById(userId) as IUser;
        if (!user) {
            throw new GraphQLError('Authorization failed', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    message: 'User disabled or doesn\'t exist',
                    http: {
                        status: 401
                    }
                },
            });
        }

            await Post.findByIdAndDelete(postId);
            if (user.posts instanceof mongoose.Types.Array) {
                user.posts.pull(postId);
            }
            imageProcessor.clearImage(post.image);
            await user.save();

            return true
    },

    updateStatus: async (parent, args, {isAuth, userId}) => {
        if (!isAuth) {
            throw new GraphQLError('Authorization failed', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: {
                        status: 401
                    }
                },
            });
        }

        let user = await User.findById(userId) as IUser;
        if (!user) {
            throw new GraphQLError('User not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }

        user.status = args.status;
        user = await user.save();

        return user.toObject();
    },
    createUser: async (parent, args, context) => {
        const userInput = args.userInput as UserData;
        const email = userInput.email;
        const name = userInput.name;
        const password = userInput.password;
        const validationErrors = [];
        if (!validator.isEmail(email)) {
            validationErrors.push({field: 'email', message: 'Invalid e-mail'});
        }
        if (validator.isEmpty(name) || !validator.isLength(name, {min: 3})) {
            validationErrors.push({field: 'name', message: 'Minimum length for name should be 3 characters'});
        }
        if (validator.isEmpty(password) || !validator.isLength(password, {min: 5})) {
            validationErrors.push({field: 'password', message: 'Minimum length for password should be 5 characters'});
        }
        //
        if (validationErrors.length > 0) {
            throw new GraphQLError('Incorrect password', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: 'Invalid e-mail or password',
                    errors: validationErrors
                },
            });

        }
        //
        let existingUser = await User.findOne({email: email});
        if (existingUser) {
            throw new GraphQLError('User with this email already exists', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }

        let user = new User({
            email: email,
            name: userInput.name,
            password: await bcrypt.hash(userInput.password, 12),
        });

        return await user.save() as IUser;
    },
};

export default mutationResolvers;