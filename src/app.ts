import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import * as mongoose from "mongoose";
import 'dotenv/config';
import multer from "multer";
import {fileStorage, fileFilter} from "./config/multer.js";
import { doAuth, doAuthApollo } from "./utils/doAuth.js";
import { readFileSync } from 'fs';
import resolvers from "./resolvers/index.js";
import {__dirname, path} from "./utils/pathHelper.js";
import {authenticate} from "./middleware/authenticate.js";
import createImageResp from "./middleware/createImageResp.js";
import UserAPI from "./magentoREST/user-api.js";

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

//Bypass express request handling for images
app.use('/images', express.static(path.join(__dirname, 'pub', 'images')));
//Add auth data to request
app.use(doAuth);
//Save image handler
app.put('/create-image',
    authenticate,
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image'),
    createImageResp
);

//Read graphql schema and create apollo server
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
});
await server.start();

// Specify the path where we'd like to mount our server
app.use('/graphql', cors<cors.CorsRequest>(), express.json(),   expressMiddleware(server, {
    context: async ({ req }) => {
        return {
            ... await doAuthApollo(req),
            dataSources: {
                userAPI:  new UserAPI(process.env.MAGENTO_TOKEN || '')
            }
        }
    }})
);

//Start main server
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hktnw6v.mongodb.net/blog`);
    app.listen(process.env.PORT || 5000, () => {
        console.log('Server started!');
    });
}
