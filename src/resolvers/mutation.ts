import {MutationResolvers, UserData} from '../generated/resolvers-types'
import validator from "validator";
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { IUser, User } from '../model/user.js';

const mutataionResolvers: MutationResolvers = {
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

export default mutataionResolvers;