import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import * as mongoose from "mongoose";
import 'dotenv/config';
import multer, {FileFilterCallback} from "multer";
import doAuth from "./utils/doAuth.js";
import { readFileSync } from 'fs';
import resolvers from "./resolvers/index.js";
import {__dirname, path} from "./utils/pathHelper.js";

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void
export const fileStorage = multer.diskStorage({
    destination: (
        request: Express.Request,
        file: Express.Multer.File,
        cb: DestinationCallback
    ): void => {
        cb(null, 'pub/images');
    },

    filename: (
        req: Express.Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ): void => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    }
})

const fileFilter = function(req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) {
    let result = file.mimetype = 'image/png' || 'image/jpg' || 'image/jpeg';
    cb(null, !!result)
};

const app = express();

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.path === '/create-image' && req.method === 'OPTIONS') {
        return  res.sendStatus(200);
    }
    next();
});

app.use('/images', express.static(path.join(__dirname, 'pub', 'images')));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

//TODO: add image uploading aviability only for authorized
app.use(authorization);
app.put('/create-image', (req, res, next) => {
    //TODO: add image uploading aviability only for authorized
    // if (!req.isAuth) {
    //     const error = new Error('Authorization failed');
    //     error.statusCode = 401;
    //     throw error;
    // }

    if (!req.file) {
        return res.status(200).json({message: 'No file provided'});
    }

    return res.status(201).json({suceess: true, image: 'images/' + req.file.filename});
});

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
await server.start();

// Specify the path where we'd like to mount our server
app.use('/graphql', cors<cors.CorsRequest>(), express.json(),   expressMiddleware(server, {
    context: async ({ req }) => { return {... await doAuth(req)} },
}),);

app.use('/', (req, res, next) => {
    res.send(path.join(__dirname, 'pub', 'images'));
});

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hktnw6v.mongodb.net/blog`);
    app.listen(process.env.PORT || 5000, () => {
        console.log('Server started!');
    });
}
