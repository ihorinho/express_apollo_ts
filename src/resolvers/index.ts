import {Resolvers} from "../generated/resolvers-types"
import Query from "./query.js";
import Mutation from "./mutation.js";

const resolvers: Resolvers = { Query, Mutation };

export default resolvers;