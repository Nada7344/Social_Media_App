import * as UserGQLTypes from './user.types.gql'
import { userResolver, UserResolver } from "./user.resolver.js"
export class UserGQLSchema {

    private userResolver:UserResolver
    constructor() {
        this.userResolver = userResolver;
    }
    registerQuery() {
        return {
            profile: {
                type: UserGQLTypes.profile,
                resolve: (parent:unknown,args:any ,context:any) => {
                    return this.userResolver.profile(parent,args ,context)
                }
            }
        }
    }


    // registerMutation(){
    //      return {
    //         sayHi: {
    //             type: GraphQLString,
    //             resolve: () => {
    //                 this.userResolver.profile()
    //             }
    //         }
    //     }
    // }
}

export const userGQLSchema = new UserGQLSchema()