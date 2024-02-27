import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import 'dotenv/config';
import doAuth from "./utils/doAuth.js";

const app = express();

const books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];

const typeDefs = `#graphql
# Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

# This "Book" type defines the queryable fields for every book in our data source.
type Book {
    title: String
    author: String
}

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "books" query returns an array of zero or more Books (defined above).
type Query {
    books: [Book]
}
`;

const resolvers = {
    Query: {
        books: (parent, args, context) => { console.log(context); return books; },
    },
};

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
app.use('/graphql', cors<cors.CorsRequest>(), express.json(),   expressMiddleware(server, {
    context: async ({ req }) => ({ ...doAuth(req.headers.authorization) }),
}),);

app.listen(process.env.PORT || 5000, () => {
    console.log('Server started!');
});