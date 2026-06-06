"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const index_js_1 = require("../user/index.js");
const post_schema_gql_js_1 = require("../post/gql/post.schema.gql.js");
const query = new graphql_1.GraphQLObjectType({
    name: "RootSchemaQuery",
    fields: {
        ...index_js_1.userGQLSchema.registerQuery(),
        ...post_schema_gql_js_1.postGQLSchema.registerQuery(),
    }
});
// const mutation = new GraphQLObjectType({
//     name:"mutationSchema",
//     fields:{
//         sayHi:{
//             type:GraphQLString,
//             resolve:()=>{
//                 return "hello nada mutation" 
//             }
//         }
//     } 
// })
exports.schema = new graphql_1.GraphQLSchema({ query });
