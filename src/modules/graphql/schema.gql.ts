import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { userGQLSchema } from '../user/index.js';
import { postGQLSchema } from '../post/gql/post.schema.gql.js';



  const query = new GraphQLObjectType({
        name:"RootSchemaQuery",
        fields:{
            ...userGQLSchema.registerQuery(),
            ...postGQLSchema.registerQuery(),
        } 
    })

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

export const schema = new GraphQLSchema({ query })
