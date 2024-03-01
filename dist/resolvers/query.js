import validator from "validator";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { GraphQLError } from 'graphql';
import { User } from '../model/user.js';
import { Post } from "../model/post.js";
import { books } from '../model/book_demo.js';
const queryResolvers = {
    books: () => books,
    getProduct: async (parent, { sku }, { dataSources }) => {
        return await dataSources.userAPI.getProduct(sku);
    },
    getPosts: async (parent, { page }, { isAuth, userId }) => {
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
        const PER_PAGE = 2;
        const curPage = page || 1;
        const totalItems = await Post.find({ creator: userId }).countDocuments();
        let posts = await Post
            .find({ creator: userId })
            .skip((curPage - 1) * PER_PAGE)
            .limit(PER_PAGE)
            .sort({ createdAt: -1 })
            .populate('creator', 'name email');
        if (!posts) {
            posts = [];
        }
        posts = posts.map(p => {
            return { ...p._doc, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() };
        });
        return { posts: posts, totalItems: totalItems };
    },
    getPost: async (parent, args, { isAuth, userId }) => {
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
        const id = args.id;
        const post = await Post.findById(id).populate('creator');
        if (!post) {
            throw new GraphQLError('Post not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        return { ...post.toObject(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString(), imageUrl: post.image };
    },
    getUser: async (parent, args, { isAuth, email }, info) => {
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
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new GraphQLError('User not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: 'Invalid e-mail address',
                },
            });
        }
        return user;
    },
    loginUser: async (parent, loginData, context) => {
        const email = loginData.email;
        if (!validator.isEmail(email)) {
            throw new GraphQLError('Invalid input', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: 'Invalid e-mail address',
                },
            });
        }
        let user = await User.findOne({ email: email });
        if (!user) {
            throw new GraphQLError('User not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: 'Invalid e-mail address',
                },
            });
        }
        //
        let match = await bcrypt.compare(loginData.password, user.password);
        if (!match) {
            throw new GraphQLError('Incorrect password', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    message: 'Invalid e-mail or password',
                },
            });
        }
        //
        const token = await jwt.sign({ userId: user._id, email: user.email }, 'mysecretkey');
        return { _id: user._id, token: token };
    },
};
export default queryResolvers;
