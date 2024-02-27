import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import * as mongoose from "mongoose";
import 'dotenv/config';
import doAuth from "./utils/doAuth.js";
import { readFileSync } from 'fs';
import resolvers from "./resolvers/index.js";
const app = express();
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
// app.use('/', (req, res, next) => {
//     res.send('Hello world!');
// });
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
await server.start();
// Specify the path where we'd like to mount our server
app.use('/graphql', cors(), express.json(), expressMiddleware(server, {
    context: async ({ req }) => { return { ...await doAuth(req) }; },
}));
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.hktnw6v.mongodb.net/blog`);
    app.listen(process.env.PORT || 5000, () => {
        console.log('Server started!');
    });
}
