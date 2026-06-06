import * as PostGQLTypes from './post.types.gql'
import * as PostGQLArgs from './post.args.gql.js'
import { postResolver, PostResolver } from "./post.resolver.js"
export class PostGQLSchema {

    private postResolver:PostResolver
    constructor() {
        this.postResolver = postResolver;
    }
    registerQuery() {
        return {
            postList: {
                type: PostGQLTypes.postList,
                args:PostGQLArgs.postList,
                resolve: ( parent:unknown,args:any ,context:any) => {
                    return this.postResolver.postList(parent,args ,context)
                }
            }
        }
    }


    // registerMutation(){
    //      return {
    //         sayHi: {
    //             type: GraphQLString,
    //             resolve: () => {
    //                 this.postResolver.profile()
    //             }
    //         }
    //     }
    // }
}

export const postGQLSchema = new PostGQLSchema()