"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postList = void 0;
const graphql_1 = require("graphql");
exports.postList = {
    page: { type: graphql_1.GraphQLInt },
    size: { type: graphql_1.GraphQLInt },
    search: { type: graphql_1.GraphQLString }
};
