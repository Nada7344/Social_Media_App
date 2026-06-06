"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const schema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: "testSchema",
        fields: {
            sayHi: {
                type: graphql_1.GraphQLString,
                resolve: () => {
                    return "hello nada";
                }
            }
        }
    })
});
