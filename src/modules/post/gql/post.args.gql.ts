import { GraphQLInt, GraphQLString } from "graphql";

export const postList = {
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search:{ type: GraphQLString }
}