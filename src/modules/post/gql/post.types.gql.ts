import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { AvailabilityEnum, ReactEnum } from "../../../common/enums/Post.enum.js";
import { OneUserType } from "../../user/gql/user.types.gql.js";

export const LikesGQLEnumType = new GraphQLEnumType({
    name: "LikesGQLEnumType",
    values: {
        Like: { value: ReactEnum.LIKE },
        DisLike: { value: ReactEnum.DISLIK },
        Haha: { value: ReactEnum.HAHA },
        Love: { value: ReactEnum.LOVE },
        Sad: { value: ReactEnum.SAD },
        Angry: { value: ReactEnum.ANGRY },

    }
})

export const AvailabilityGQLEnumType = new GraphQLEnumType({
    name: "AvailabilityGQLEnumType",
    values: {
        Public: { value:AvailabilityEnum.PUBLIC },
       Friends: { value: AvailabilityEnum.FRIENDS },
      Only: { value: AvailabilityEnum.ONLY_ME },
       

    }
})

const ReactType: GraphQLObjectType = new GraphQLObjectType({
    name: "ReactType",
    fields: {
        react: { type: LikesGQLEnumType },
        createdBy: { type: OneUserType }
    }
})



export const OnePostType: GraphQLObjectType = new GraphQLObjectType({
    name: "OnePostType",
    fields: {
        _id:{type:GraphQLID},
        folderId: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        likes: { type: new GraphQLList(ReactType) },
        tags: { type: new GraphQLList(OneUserType) },
        availability: {type:AvailabilityGQLEnumType},

        createdBy: { type: new GraphQLNonNull(OneUserType) },
        updatedBy: { type: OneUserType },

        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        updatedAt: { type: GraphQLString },
        restoredAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
    }
})


export const postList = new GraphQLNonNull(new GraphQLObjectType({
    name: "PostListResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "PostPaginationResponse",
                fields: {
                    docs: { type: new GraphQLList(OnePostType) },
                    currentPage: { type: GraphQLInt },
                    pages: { type: GraphQLInt },
                    size: { type: GraphQLInt },
                }
            })
        }
    }
}))